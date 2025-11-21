import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">🔍 AgentOps Monitor</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">
            Production-Ready Observability for{" "}
            <span className="text-blue-600">Google ADK Agents</span>
          </h2>
          <p className="text-xl text-slate-600">
            Monitor, debug, and optimize your AI agents with native Google ADK
            integration and A2A protocol support.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Start Free</Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline">
                View Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="mb-12 text-center text-3xl font-bold">
          Why AgentOps Monitor?
        </h3>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-6">
            <div className="mb-4 text-4xl">🤖</div>
            <h4 className="mb-2 text-xl font-bold">ADK-Native</h4>
            <p className="text-slate-600">
              Built specifically for Google ADK with support for LlmAgent,
              SequentialAgent, and Runner execution tracking.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-4xl">📨</div>
            <h4 className="mb-2 text-xl font-bold">A2A Protocol</h4>
            <p className="text-slate-600">
              Monitor multi-agent communication with native Agent-to-Agent
              protocol support and visualization.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-4xl">💰</div>
            <h4 className="mb-2 text-xl font-bold">Cost Tracking</h4>
            <p className="text-slate-600">
              Track token usage and costs across all models. Gemini 2.0 Flash is
              FREE!
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-4xl">⚡</div>
            <h4 className="mb-2 text-xl font-bold">Real-time</h4>
            <p className="text-slate-600">
              See traces as they happen with live execution monitoring and
              instant alerts.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-4xl">🔧</div>
            <h4 className="mb-2 text-xl font-bold">Tool Tracking</h4>
            <p className="text-slate-600">
              Monitor all tool executions with inputs, outputs, and error
              tracking.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-4xl">📊</div>
            <h4 className="mb-2 text-xl font-bold">Analytics</h4>
            <p className="text-slate-600">
              Comprehensive analytics for performance, costs, and agent behavior
              patterns.
            </p>
          </Card>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-t bg-white py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Get Started in 2 Minutes
          </h3>
          <div className="mx-auto max-w-2xl space-y-4">
            <Card className="p-6">
              <p className="mb-2 font-mono text-sm text-slate-600">
                1. Install SDK
              </p>
              <pre className="rounded bg-slate-900 p-4 text-white">
                pip install agentops-monitor
              </pre>
            </Card>

            <Card className="p-6">
              <p className="mb-2 font-mono text-sm text-slate-600">
                2. Wrap your ADK agent
              </p>
              <pre className="rounded bg-slate-900 p-4 text-white">
                {`from agentops_monitor import monitor_runner
from google.adk.agents import LlmAgent
from google.adk.runners import Runner

agent = LlmAgent(name="MyAgent", model="gemini-2.0-flash")
runner = Runner(agent)

# Add monitoring with 1 line
monitored_runner = monitor_runner(runner, api_key="agentops_xxx")
monitored_runner.run("Hello!")`}
              </pre>
            </Card>

            <Card className="p-6">
              <p className="mb-2 font-mono text-sm text-slate-600">
                3. View in dashboard
              </p>
              <p className="text-slate-600">
                Open your dashboard to see real-time traces, costs, and
                performance metrics!
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>Built for the Google 5-Day AI Agents Intensive Course</p>
          <p className="mt-2 text-sm">© 2025 AgentOps Monitor</p>
        </div>
      </footer>
    </div>
  );
}
