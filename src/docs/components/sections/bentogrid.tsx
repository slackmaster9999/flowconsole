'use client'
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { useTheme } from "next-themes";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, gradientDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function BentoGrid() {
  const { theme } = useTheme(); 
  const highlighterTheme = theme === 'dark' ? gradientDark : docco;
  const sample = `import { User, ComputerSystem, Container, ReactApp } from "@flowconsole/sdk";

const user = new User({ name: "Customer", description: "Customer of Cloud System" });

const system = new ComputerSystem({ name: "Cloud System" });
const storage = new Container({ name: "Data Store", belongsTo: system });
const backend = new Container({ name: "Backend", belongsTo: system });

const frontApp = new ReactApp({
  name: "Customer Dashboard",
  description: "Browser Single-page Application",
  belongsTo: system
});`;
  return (
    <section className="py-32">
      <MaxWidthWrapper>
        <div className="relative z-10 grid grid-cols-6 gap-3">
          {/* First card */}
          <div className="relative col-span-full flex overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-2">
            <div >
              <div className="relative mx-auto flex  size-32 ">
                <svg fill="#7c3aed" className="m-auto h-fit w-24" style={{ width: '68px', height: '75px' }}
                  xmlns="http://www.w3.org/2000/svg" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M62.817,2.583H6.026c-2.209,0-3.443,2.06-3.443,4.269v57c0,2.209,1.234,2.731,3.443,2.731h57 c2.209,0,3.557-0.522,3.557-2.731v-58C66.583,3.643,65.026,2.583,62.817,2.583z M62.583,6.583v9h-56v-9H62.583z M6.583,62.583v-45 h56v45H6.583z"></path> <path d="M10.417,12.583h2c0.553,0,1-0.447,1-1s-0.447-1-1-1h-2c-0.553,0-1,0.447-1,1S9.864,12.583,10.417,12.583z"></path> <path d="M16.417,12.583h2c0.553,0,1-0.447,1-1s-0.447-1-1-1h-2c-0.553,0-1,0.447-1,1S15.864,12.583,16.417,12.583z"></path> <path d="M22.417,12.583h2c0.553,0,1-0.447,1-1s-0.447-1-1-1h-2c-0.553,0-1,0.447-1,1S21.864,12.583,22.417,12.583z"></path> <path d="M26.109,33.077c-0.429-0.35-1.058-0.285-1.406,0.143l-5.944,7.283c-0.293,0.357-0.302,0.87-0.021,1.238l5.944,7.801 c0.196,0.258,0.494,0.394,0.796,0.394c0.211,0,0.424-0.066,0.605-0.205c0.438-0.334,0.523-0.962,0.188-1.401l-5.466-7.173 l5.445-6.673C26.602,34.056,26.538,33.426,26.109,33.077z"></path> <path d="M44.328,33.245c-0.333-0.438-0.96-0.525-1.401-0.188c-0.439,0.334-0.523,0.962-0.188,1.401l5.466,7.172l-5.445,6.674 c-0.35,0.428-0.286,1.058,0.143,1.406c0.186,0.152,0.409,0.226,0.631,0.226c0.29,0,0.578-0.126,0.775-0.368l5.944-7.284 c0.293-0.358,0.302-0.87,0.021-1.238L44.328,33.245z"></path> <path d="M31.241,31.734c-0.205-0.514-0.786-0.762-1.299-0.561c-0.514,0.204-0.764,0.786-0.561,1.299l7.916,19.918 c0.156,0.393,0.532,0.631,0.93,0.631c0.123,0,0.248-0.022,0.369-0.07c0.514-0.204,0.764-0.786,0.561-1.299L31.241,31.734z"></path> </g> </g></svg>
              </div>
              <h2 className="mt-6 text-center font-heading text-3xl md:text-4xl lg:text-[20px]">
                Define your architecture in Typescript
              </h2>
              <br/>
              <span className="mt-6 text-center text-gradient_indigo-purple">C#, Java, Go, Python (preview)</span>
            </div>
          </div>

          {/* Second card */}

          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div className="relative mx-auto flex size-32">
                <svg
                  className="m-auto h-fit w-24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M6 5C6 4.44772 6.44772 4 7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5ZM8 7.82929C9.16519 7.41746 10 6.30622 10 5C10 3.34315 8.65685 2 7 2C5.34315 2 4 3.34315 4 5C4 6.30622 4.83481 7.41746 6 7.82929V16.1707C4.83481 16.5825 4 17.6938 4 19C4 20.6569 5.34315 22 7 22C8.65685 22 10 20.6569 10 19C10 17.7334 9.21506 16.6501 8.10508 16.2101C8.45179 14.9365 9.61653 14 11 14H13C16.3137 14 19 11.3137 19 8V7.82929C20.1652 7.41746 21 6.30622 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.30622 15.8348 7.41746 17 7.82929V8C17 10.2091 15.2091 12 13 12H11C9.87439 12 8.83566 12.3719 8 12.9996V7.82929ZM18 6C18.5523 6 19 5.55228 19 5C19 4.44772 18.5523 4 18 4C17.4477 4 17 4.44772 17 5C17 5.55228 17.4477 6 18 6ZM6 19C6 18.4477 6.44772 18 7 18C7.55228 18 8 18.4477 8 19C8 19.5523 7.55228 20 7 20C6.44772 20 6 19.5523 6 19Z" fill="#7c3aed"></path> </g>
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  Always in sync
                </h2>
                <p className="text-muted-foreground">
                  Integrates with your infrastructure and build pipelines
                </p>
              </div>
            </div>
          </div>

          {/* Third card */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div  className="relative mx-auto flex size-32">
                <svg
                  className="m-auto h-fit w-24"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M9 0V2H13L16 8.5L13 15H3L0 8.5L3 2H7V0H9ZM4.59794 11.7384L8 12.2618L11.4021 11.7384L11.0979 9.76163L8 10.2382L4.90206 9.76163L4.59794 11.7384ZM7 6.75C7 7.44036 6.44036 8 5.75 8C5.05964 8 4.5 7.44036 4.5 6.75C4.5 6.05964 5.05964 5.5 5.75 5.5C6.44036 5.5 7 6.05964 7 6.75ZM10.25 8C10.9404 8 11.5 7.44036 11.5 6.75C11.5 6.05964 10.9404 5.5 10.25 5.5C9.55964 5.5 9 6.05964 9 6.75C9 7.44036 9.55964 8 10.25 8Z" fill="#7c3aed"></path> </g>
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  AI Friendly
                </h2>
                <p className="text-muted-foreground">
                  Provide architectural context for your developers and agents
                </p>
              </div>
            </div>
          </div>

          {/* Second row */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-3">
            <div className="grid sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-foreground">
                    Fast iterations
                  </h2>
                  <p className="text-muted-foreground">
                    Immediate feedback, preview and validation
                  </p>
                </div>
              </div>
              <div className="relative -mb-10 -mr-10 mt-8 h-fit rounded-tl-xl border bg-muted/30 pt-6 sm:ml-6 sm:mt-auto">
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                </div>
                <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{width: '200px', height:'200px', marginLeft: '50px'}} fill="#000000">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <g id="🔍-Product-Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="ic_fluent_shifts_team_24_filled" fill="#7c3aed" fillRule="nonzero">
                      <path d="M6.5,12 C9.53756612,12 12,14.4624339 12,17.5 C12,20.5375661 9.53756612,23 6.5,23 C3.46243388,23 1,20.5375661 1,17.5 C1,14.4624339 3.46243388,12 6.5,12 Z M17.75,3 C19.5449254,3 21,4.45507456 21,6.25 L21,17.75 C21,19.5449254 19.5449254,21 17.75,21 L11.9774077,21.0012092 C12.6247042,19.9906579 13,18.7891565 13,17.5 C13,15.9846422 12.4814474,14.5903989 11.6108398,13.4871142 L11.6794988,13.4967299 L11.75,13.5 L16.2482627,13.5 L16.3500333,13.4931534 C16.7161089,13.443491 16.9982627,13.1296958 16.9982627,12.75 C16.9982627,12.3703042 16.7161089,12.056509 16.3500333,12.0068466 L16.2482627,12 L12.5,12 L12.5,6.75 L12.4931534,6.64822944 C12.443491,6.28215388 12.1296958,6 11.75,6 C11.3703042,6 11.056509,6.28215388 11.0068466,6.64822944 L11,6.75 L11,12.75 L11.0048315,12.8142135 C9.83648038,11.690706 8.24890171,11 6.5,11 C5.21084353,11 4.00934208,11.3752958 2.99879075,12.0225923 L3,6.25 C3,4.45507456 4.45507456,3 6.25,3 L17.75,3 Z M6.5,17.5 L3.5,17.5 C3.25454011,17.5 3.05039163,17.6768752 3.00805567,17.9101244 L3,18 L3,18.4959046 C3,19.4903671 3.75658207,19.9935852 5,19.9935852 C6.18120738,19.9935852 6.92312074,19.5398532 6.99435906,18.6422942 L7,18.4968875 L7,18 C7,17.7238576 6.77614237,17.5 6.5,17.5 Z M9.52012224,17.4861631 L7.9091402,17.4846863 C7.95322679,17.605209 7.98229213,17.7329685 7.99406939,17.8656979 L8,18 L8,18.4968875 L7.99278617,18.7088676 C7.97362373,18.9853255 7.91658306,19.2370411 7.82523727,19.4638622 C7.95879832,19.4777061 8.10072734,19.4845107 8.25029164,19.4845107 C9.27626263,19.4845107 9.94293361,19.1646461 10.0138416,18.4487547 L10.0201222,18.3182944 L10.0201222,17.9861631 C10.0201222,17.7407032 9.84324708,17.5365547 9.60999787,17.4942187 L9.52012224,17.4861631 Z M5,14.5 C4.4467725,14.5 3.99829299,14.9484795 3.99829299,15.501707 C3.99829299,16.0549345 4.4467725,16.503414 5,16.503414 C5.5532275,16.503414 6.00170701,16.0549345 6.00170701,15.501707 C6.00170701,14.9484795 5.5532275,14.5 5,14.5 Z M8.13031287,14.7573556 C7.64811242,14.7573556 7.25721172,15.1482563 7.25721172,15.6304568 C7.25721172,16.1126572 7.64811242,16.5035579 8.13031287,16.5035579 C8.61251332,16.5035579 9.00341401,16.1126572 9.00341401,15.6304568 C9.00341401,15.1482563 8.61251332,14.7573556 8.13031287,14.7573556 Z" id="🎨-Color">
                      </path>
                    </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 lg:col-span-3">
            <div className="grid h-full sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">

                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-foreground">
                    Easy to use
                  </h2>
                  <p className="text-muted-foreground">
                    Intuitive API designed for developers and architects
                  </p>
                </div>
              </div>
              <div className="relative -mb-10 -mr-10 mt-8 h-fit rounded-tl-xl border bg-muted/30 pt-6 sm:ml-6 sm:mt-auto">
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                  <span className="block size-2 rounded-full border border-border"></span>
                </div>
                <div style={{ height: '250px' }}>
                    <SyntaxHighlighter language="javascript" style={highlighterTheme}>
                       {sample}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        
          {/* Third row */}
          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div className="text-center text font-heading text-lg  md:text-4xl lg:text-[80px]" style={{height: '120px', paddingTop: '20px', color: '#7c3aed'}}>
                <h1>C4</h1>
              </div>
              <div className="relative space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  Solid foundation
                </h2>
                <p className="text-muted-foreground">
                  Based on C4 model for modern customization options.
                </p>
              </div>
            </div>
          </div>

          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div>
                <svg  className="m-auto h-fit w-24" fill="#7c3aed" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" stroke="#7c3aed"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1581.235 734.118c0 217.976-177.317 395.294-395.294 395.294H960.06c-217.977 0-395.294-177.318-395.294-395.294V564.706h1016.47v169.412Zm225.883-282.353h-338.824V0h-112.941v451.765H790.647V0H677.706v451.765H338.882v112.94h112.942v169.413c0 280.207 228.028 508.235 508.235 508.235h56.47v395.294c0 93.402-76.009 169.412-169.411 169.412-93.403 0-169.412-76.01-169.412-169.412 0-155.633-126.72-282.353-282.353-282.353S113 1482.014 113 1637.647V1920h112.941v-282.353c0-93.402 76.01-169.412 169.412-169.412s169.412 76.01 169.412 169.412c0 155.633 126.72 282.353 282.353 282.353 155.746 0 282.353-126.72 282.353-282.353v-395.294h56.47c280.207 0 508.235-228.028 508.235-508.235V564.706h112.942V451.765Z" fillRule="evenodd"></path> </g></svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  Integrate Anywhere
                </h2>
                <p className="text-muted-foreground text-gradient_indigo-purple">
                  [WIP] Embed architecture artifacts into docs, websites or apps
                </p>
              </div>
            </div>
          </div>

          <div className="relative col-span-full overflow-hidden rounded-2xl border bg-background p-8 sm:col-span-3 lg:col-span-2">
            <div>
              <div>
                <svg className="m-auto h-fit w-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.5 12.4L10.9286 14L14.5 10" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 14.4963 20.1632 16.4284 19 17.9041M3.19284 14C4.05026 18.2984 7.57641 20.5129 9.89856 21.5273C10.62 21.8424 10.9807 22 12 22C13.0193 22 13.38 21.8424 14.1014 21.5273C14.6796 21.2747 15.3324 20.9478 16 20.5328" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
              </div>
              <div className="relative z-10 mt-8 space-y-1.5 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  Guard your architecture
                </h2>
                <p className="text-muted-foreground text-gradient_indigo-purple">
                  [WIP] Track architecture drift and enforce policies and standards within your team or company
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
