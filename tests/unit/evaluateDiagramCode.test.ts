import { describe, it, expect } from 'vitest';
import { evaluateDiagramCode } from '../../src/core/languages/typescript/evaluateDiagramCode';


const validProgram = `const user: User = { name: "Analyst" };
const system: ComputerSystem = { name: "Insight" };
const api: RestApi = { name: "Reporting API", belongsTo: system };
user.sendsRequestTo(api, "fetch");`;

const invalidProgram = `const user: User = { name: "Analyst" };
user.sendsRequestTo(missingTarget, "boom");`;

describe('evaluateDiagramCode', () => {
  it('builds a ReactFlow model when code is valid', async () => {
    const result = await evaluateDiagramCode(validProgram);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.model.nodes.length).toBeGreaterThanOrEqual(3);
      const labels = result.model.nodes.map((node) => node.data.title);
      expect(labels).toContain('Analyst');
    }
  }, 15000);

  it('returns diagnostic errors when code is invalid', async () => {
    const result = await evaluateDiagramCode(invalidProgram);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('missingTarget');
    }
  });

  it('handles satisfies expressions and builds entities', async () => {
    const result = await evaluateDiagramCode(
      `const app = { name: "Web" } satisfies ReactApp;
       app.executesRequest?.("self");`
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.model.nodes.some((n) => n.data.title === 'Web')).toBe(true);
      expect(result.model.edges.length).toBeGreaterThan(0);
    }
  }, 15000);

  it('returns runtime errors from evaluated code', async () => {
    const result = await evaluateDiagramCode(`throw new Error("boom")`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('boom');
    }
  });

  it('ignores unknown entity types', async () => {
    const result = await evaluateDiagramCode(
      `type Unknown = { name: string };
       const foo: Unknown = { name: "Foo" };`
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.model.nodes.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('reports TypeScript diagnostics with line info', async () => {
    const result = await evaluateDiagramCode(
      `const user: User = { name: "Analyst" };
       const broken = ;`
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/line/i);
    }
  });
});
