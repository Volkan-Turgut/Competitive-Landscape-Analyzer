# Forward Deployed Engineer - Take-Home Assignment

## Overview

Build a working application where a user provides a company and a product/market space, and the system analyzes the competitive landscape to determine whether that market is a fit for the company.

The system should be company-agnostic - it works for any company and any market. Your system should cover three research spaces and a synthesis layer. How you architect your agents around these is up to you.

## Research Spaces

**1. Incumbents**
Established enterprise players in the product space - who they are, what they offer, how they're positioned.

**2. Emerging Competitors**
Recent funding activity (Seed through Series B), new entrants, and the velocity of capital flowing into the space.

**3. Market Sizing**
Quantitative analysis - TAM/SAM, growth projections, and supporting data from industry sources (Gartner, Forrester, Statista, etc.).

## Synthesis

**Opportunity Assessment**
The decision engine. Cross-reference findings from the three research spaces to evaluate white space and deliver a Go/No-Go recommendation with reasoning.

## What We're Evaluating

| Area | What we're looking for |
|---|---|
| **Solution Design** | Did you make smart decisions about what to build and why? Can you articulate the tradeoffs? |
| **Agent Architecture** | How did you map agents to research spaces? Are they well-scoped? Does data flow between them intelligently? |
| **AI Fluency** | Are you using LLMs effectively - right model for the task, good prompts, tool calling, structured outputs? |
| **Design Instinct** | Does the frontend feel like a product? Would a non-technical stakeholder understand and trust it? |
| **Code Quality** | Is the code clean, typed, and well-structured? Not over-engineered, not under-engineered. |

## Deliverables

- A GitHub repo with a README that includes:
  - How to run the application
  - A brief explanation of your architecture and the decisions you made
- A working backend with an agentic architecture that covers all three research spaces and the synthesis layer
- A working frontend that can be used to trigger and review analyses (with design and UX in mind)
- Be prepared to demo and walk us through your thinking live

## Constraints

- **Due:** Sunday by 5:00 PM
- **Backend:** Python (FastAPI + Pydantic recommended)
- **Frontend:** React + TypeScript recommended
- **Agent Framework:** We recommend [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) or [Pydantic AI](https://ai.pydantic.dev/) - but use whatever you're most effective with
- **LLM Provider(s):** Your choice. Use what you have available to you.