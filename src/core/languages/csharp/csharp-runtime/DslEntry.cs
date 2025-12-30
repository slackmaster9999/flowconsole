using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace FlowConsole.CSharpDslRuntime;

public static class DslEntry
{
    public static string Evaluate(string source)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var runtime = new DslRuntime();
        DslRuntimeContext.Current = runtime;

        try
        {
            var scriptOptions = ScriptOptions.Default
                .WithReferences(typeof(DslEntry).Assembly)
                .WithImports(
                    "System",
                    "System.Linq",
                    "System.Collections.Generic",
                    "FlowConsole.CSharpDslRuntime"
                );

            CSharpScript.RunAsync(source ?? string.Empty, scriptOptions).GetAwaiter().GetResult();
        }
        catch (CompilationErrorException ex)
        {
            var message = string.Join("\n", ex.Diagnostics.Select(d => d.ToString()));
            return JsonSerializer.Serialize(new { ok = false, error = message }, options);
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { ok = false, error = ex.Message }, options);
        }
        finally
        {
            DslRuntimeContext.Current = null;
        }

        var model = runtime.BuildReactFlowModel();
        return JsonSerializer.Serialize(new { ok = true, model }, options);
    }
}

public static class DslRuntimeContext
{
    [ThreadStatic] public static DslRuntime? Current;
}

public class ConnectionOptions
{
    public string? Detail { get; set; }
    public string? Kind { get; set; }
    public string? Icon { get; set; }
    public bool? Muted { get; set; }
}

public abstract class DiagramEntity
{
    internal DslRuntime Runtime => DslRuntimeContext.Current
        ?? throw new InvalidOperationException("Runtime not available. Evaluate() should set DslRuntimeContext.Current.");

    public string? Id { get; set; }
    public string Name { get; set; } = "Entity";
    public string? Description { get; set; }
    public DiagramEntity? BelongsTo { get; set; }
    public DiagramEntity? System { get; set; }
    public string[]? Tags { get; set; }
    public string? Badge { get; set; }
    public string? Tone { get; set; }

    protected DiagramEntity()
    {
        Runtime.Register(this);
    }

    internal virtual string TypeName => GetType().Name;

    public FlowBuilder SendsRequestTo(DiagramEntity target, string label, ConnectionOptions? options = null)
        => new FlowBuilder(Runtime, this).SendsRequestTo(target, label, options);

    public FlowBuilder GetDataFrom(DiagramEntity target, string label, ConnectionOptions? options = null)
        => new FlowBuilder(Runtime, this).GetDataFrom(target, label, options);

    public FlowBuilder ExecutesRequest(string action, ConnectionOptions? options = null)
        => new FlowBuilder(Runtime, this).ExecutesRequest(action, options);
}

public class User : DiagramEntity
{
    public string? Persona { get; set; }
    internal override string TypeName => nameof(User);
}

public class ComputerSystem : DiagramEntity
{
    public string? Domain { get; set; }
    internal override string TypeName => nameof(ComputerSystem);
}

public class Container : DiagramEntity
{
    public string? Technology { get; set; }
    internal override string TypeName => nameof(Container);
}

public class ReactApp : DiagramEntity
{
    public string? Framework { get; set; }
    public string? Url { get; set; }
    internal override string TypeName => nameof(ReactApp);
}

public class RestApi : DiagramEntity
{
    public string? Method { get; set; }
    public string? Endpoint { get; set; }
    internal override string TypeName => nameof(RestApi);
}

public class Redis : DiagramEntity
{
    public string? Cluster { get; set; }
    internal override string TypeName => nameof(Redis);
}

public class Postgres : DiagramEntity
{
    public string? Schema { get; set; }
    internal override string TypeName => nameof(Postgres);
}

public class KafkaTopic : DiagramEntity
{
    public int? PartitionCount { get; set; }
    internal override string TypeName => nameof(KafkaTopic);
}

public class MessageQueue : DiagramEntity
{
    public string? Throughput { get; set; }
    internal override string TypeName => nameof(MessageQueue);
}

public class ExternalService : DiagramEntity
{
    public string? Vendor { get; set; }
    internal override string TypeName => nameof(ExternalService);
}

public class BackgroundJob : DiagramEntity
{
    public string? Schedule { get; set; }
    internal override string TypeName => nameof(BackgroundJob);
}

public class FlowBuilder
{
    private readonly DslRuntime _runtime;
    private DiagramEntity _current;

    public FlowBuilder(DslRuntime runtime, DiagramEntity current)
    {
        _runtime = runtime;
        _current = current;
    }

    public FlowBuilder Then(DiagramEntity entity)
    {
        _current = entity;
        return this;
    }

    public FlowBuilder SendsRequestTo(DiagramEntity target, string label, ConnectionOptions? options = null)
    {
        _runtime.AddConnection(_current, target, label, options?.Kind ?? "sync", options);
        _current = target;
        return this;
    }

    public FlowBuilder GetDataFrom(DiagramEntity target, string label, ConnectionOptions? options = null)
    {
        _runtime.AddConnection(_current, target, label, options?.Kind ?? "dependency", options);
        return this;
    }

    public FlowBuilder ExecutesRequest(string action, ConnectionOptions? options = null)
    {
        _runtime.AddConnection(_current, _current, action, options?.Kind ?? "event", options);
        return this;
    }

    public FlowBuilder InParallel(params Func<FlowBuilder>[] branches)
    {
        foreach (var branch in branches)
        {
            try
            {
                branch()?.ToString();
            }
            catch
            {
                // ignore branch failures
            }
        }
        return this;
    }
}

public class DslRuntime
{
    private readonly List<EntityRecord> _entities = new();
    private readonly ConcurrentDictionary<string, int> _slugCounts = new();
    private readonly List<ConnectionRecord> _connections = new();
    private int _edgeCounter = 0;

    private static readonly HashSet<string> AllowedTypes = new(new[]
    {
        nameof(User), nameof(ComputerSystem), nameof(Container), nameof(ReactApp), nameof(RestApi),
        nameof(Redis), nameof(Postgres), nameof(KafkaTopic), nameof(MessageQueue), nameof(ExternalService),
        nameof(BackgroundJob)
    });

    public void Register(DiagramEntity entity)
    {
        if (!AllowedTypes.Contains(entity.TypeName))
        {
            throw new InvalidOperationException($"Type {entity.TypeName} unsupported");
        }

        var name = string.IsNullOrWhiteSpace(entity.Name) ? entity.TypeName : entity.Name.Trim();
        var id = ResolveId(entity.Id, name);
        var parentId = entity.BelongsTo?.Id ?? entity.System?.Id;
        var metadata = CaptureMetadata(entity);

        entity.Id = id;

        _entities.Add(new EntityRecord
        {
            Id = id,
            Type = entity.TypeName,
            Name = name,
            Description = entity.Description,
            ParentId = parentId,
            Tags = entity.Tags,
            Badge = entity.Badge,
            Tone = entity.Tone,
            Metadata = metadata
        });
    }

    public void AddConnection(DiagramEntity source, DiagramEntity target, string label, string kind, ConnectionOptions? options)
    {
        if (source.Id is null || target.Id is null) return;
        _edgeCounter += 1;
        _connections.Add(new ConnectionRecord
        {
            Id = $"rel-{_edgeCounter}",
            SourceId = source.Id,
            TargetId = target.Id,
            Label = string.IsNullOrWhiteSpace(label) ? "request" : label,
            Detail = options?.Detail,
            Kind = string.IsNullOrWhiteSpace(kind) ? "sync" : kind,
            Icon = options?.Icon,
            Muted = options?.Muted ?? false
        });
    }

    public ArchitectureDiagramModel BuildReactFlowModel()
    {
        var nodes = _entities.Select(BuildNode).ToList();
        nodes.Sort((a, b) =>
        {
            if (a.Type == b.Type) return 0;
            if (a.Type == "container") return -1;
            if (b.Type == "container") return 1;
            return 0;
        });

        var edges = _connections.Select(BuildEdge).ToList();
        return new ArchitectureDiagramModel { Nodes = nodes, Edges = edges };
    }

    private static EntityRecordMetadata CaptureMetadata(DiagramEntity entity)
    {
        var metadata = new EntityRecordMetadata();
        switch (entity)
        {
            case Container c:
                metadata.Technology = c.Technology;
                break;
            case ReactApp r:
                metadata.Framework = r.Framework;
                metadata.Url = r.Url;
                break;
            case RestApi api:
                metadata.Method = api.Method;
                metadata.Endpoint = api.Endpoint;
                break;
            case Redis redis:
                metadata.Cluster = redis.Cluster;
                break;
            case Postgres pg:
                metadata.Schema = pg.Schema;
                break;
            case KafkaTopic topic:
                metadata.PartitionCount = topic.PartitionCount;
                break;
            case MessageQueue mq:
                metadata.Throughput = mq.Throughput;
                break;
            case ExternalService ext:
                metadata.Vendor = ext.Vendor;
                break;
            case BackgroundJob job:
                metadata.Schedule = job.Schedule;
                break;
            case ComputerSystem sys:
                metadata.Domain = sys.Domain;
                break;
        }
        return metadata;
    }

    private ArchitectureNode BuildNode(EntityRecord entity)
    {
        var render = RenderHints.GetStyles(entity.Type);
        var baseNode = new ArchitectureNode
        {
            Id = entity.Id,
            Position = new Position { X = 0, Y = 0 },
            ParentId = entity.ParentId
        };

        if (render.NodeType == "container")
        {
            baseNode.Type = "container";
            baseNode.Data = new NodeData
            {
                Title = entity.Name,
                Description = entity.Description,
                Tags = entity.Tags,
                Badge = entity.Badge,
                Tone = entity.Tone,
                Expanded = true
            };
            return baseNode;
        }

        baseNode.Type = "element";
        baseNode.Data = new NodeData
        {
            Title = entity.Name,
            Subtitle = PickSubtitle(entity.Metadata),
            Description = entity.Description,
            Tags = entity.Tags,
            Badge = entity.Badge,
            Tone = entity.Tone ?? render.Tone,
            Shape = render.Shape,
            Icon = render.Icon
        };

        return baseNode;
    }

    private ArchitectureEdge BuildEdge(ConnectionRecord rel)
    {
        return new ArchitectureEdge
        {
            Id = rel.Id,
            Type = "relationship",
            Source = rel.SourceId,
            Target = rel.TargetId,
            Data = new EdgeData
            {
                Label = rel.Label,
                Detail = rel.Detail,
                Kind = rel.Kind,
                Icon = rel.Icon,
                Muted = rel.Muted
            }
        };
    }

    private string ResolveId(string? explicitId, string name)
    {
        if (!string.IsNullOrWhiteSpace(explicitId)) return explicitId.Trim();
        var slugBase = Slugify(name);
        var current = _slugCounts.AddOrUpdate(slugBase, 0, (_, val) => val + 1);
        return current == 0 ? slugBase : $"{slugBase}-{current}";
    }

    private static string Slugify(string value)
    {
        var chars = value.Trim().ToLowerInvariant().ToCharArray();
        var result = new List<char>(chars.Length);
        bool lastDash = true;
        foreach (var ch in chars)
        {
            if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
            {
                result.Add(ch);
                lastDash = false;
            }
            else
            {
                if (!lastDash)
                {
                    result.Add('-');
                    lastDash = true;
                }
            }
        }

        while (result.Count > 0 && result[0] == '-') result.RemoveAt(0);
        while (result.Count > 0 && result[^1] == '-') result.RemoveAt(result.Count - 1);
        return new string(result.ToArray());
    }

    private static string? PickSubtitle(EntityRecordMetadata meta)
    {
        return meta.Technology
            ?? meta.Framework
            ?? meta.Vendor
            ?? meta.Schedule
            ?? meta.Domain
            ?? meta.Endpoint
            ?? meta.Method;
    }
}

internal record EntityRecord
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ParentId { get; init; }
    public string[]? Tags { get; init; }
    public string? Badge { get; init; }
    public string? Tone { get; init; }
    public EntityRecordMetadata Metadata { get; init; } = new();
}

internal record EntityRecordMetadata
{
    public string? Technology { get; set; }
    public string? Framework { get; set; }
    public string? Url { get; set; }
    public string? Method { get; set; }
    public string? Endpoint { get; set; }
    public string? Cluster { get; set; }
    public string? Schema { get; set; }
    public int? PartitionCount { get; set; }
    public string? Throughput { get; set; }
    public string? Vendor { get; set; }
    public string? Schedule { get; set; }
    public string? Domain { get; set; }
}

internal record ConnectionRecord
{
    public string Id { get; init; } = string.Empty;
    public string SourceId { get; init; } = string.Empty;
    public string TargetId { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string? Detail { get; init; }
    public string Kind { get; init; } = "sync";
    public string? Icon { get; init; }
    public bool Muted { get; init; }
}

public record ArchitectureDiagramModel
{
    public List<ArchitectureNode> Nodes { get; init; } = new();
    public List<ArchitectureEdge> Edges { get; init; } = new();
}

public record ArchitectureNode
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "element";
    public Position Position { get; set; } = new();
    public string? ParentId { get; set; }
    public NodeData Data { get; set; } = new();
}

public record Position
{
    public int X { get; set; }
    public int Y { get; set; }
}

public record NodeData
{
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? Description { get; set; }
    public string[]? Tags { get; set; }
    public string? Badge { get; set; }
    public string? Tone { get; set; }
    public string? Shape { get; set; }
    public string? Icon { get; set; }
    public bool? Expanded { get; set; }
}

public record ArchitectureEdge
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "relationship";
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public EdgeData Data { get; set; } = new();
}

public record EdgeData
{
    public string? Label { get; set; }
    public string? Detail { get; set; }
    public string? Kind { get; set; }
    public string? Icon { get; set; }
    public bool? Muted { get; set; }
}

internal static class RenderHints
{
    private static readonly Dictionary<string, RenderConfig> Styles = new(StringComparer.OrdinalIgnoreCase)
    {
        [nameof(User)] = new RenderConfig { NodeType = "element", Shape = "person", Tone = "primary" },
        [nameof(ComputerSystem)] = new RenderConfig { NodeType = "container" },
        [nameof(Container)] = new RenderConfig { NodeType = "container" },
        [nameof(ReactApp)] = new RenderConfig { NodeType = "element", Shape = "service" },
        [nameof(RestApi)] = new RenderConfig { NodeType = "element", Shape = "service" },
        [nameof(Redis)] = new RenderConfig { NodeType = "element", Shape = "database", Tone = "muted" },
        [nameof(Postgres)] = new RenderConfig { NodeType = "element", Shape = "database", Tone = "muted" },
        [nameof(KafkaTopic)] = new RenderConfig { NodeType = "element", Shape = "queue", Tone = "warning" },
        [nameof(MessageQueue)] = new RenderConfig { NodeType = "element", Shape = "queue", Tone = "primary" },
        [nameof(ExternalService)] = new RenderConfig { NodeType = "element", Shape = "service", Tone = "muted" },
        [nameof(BackgroundJob)] = new RenderConfig { NodeType = "element", Shape = "service", Tone = "primary" },
    };

    public static RenderConfig GetStyles(string type)
    {
        return Styles.TryGetValue(type, out var config)
            ? config
            : new RenderConfig { NodeType = "element" };
    }
}

internal record RenderConfig
{
    public string NodeType { get; init; } = "element";
    public string? Shape { get; init; }
    public string? Tone { get; init; }
    public string? Icon { get; init; }
}
