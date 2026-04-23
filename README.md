# The Daily Reflection Tree

This repository contains the solution for the DT Fellowship Assignment: a deterministic, LLM-free daily reflection tool built around the three psychological axes of Locus, Orientation, and Radius.

## Repository Structure

- `reflection-tree.json` - The core deterministic tree data (Part A)
- `tree-diagram.md` - A visual Mermaid.js representation of the tree (Part A)
- `write-up.md` - Design rationale and psychological grounding (Part A)
- `agent/reflection_agent.py` - The CLI interpreter for the tree (Part B)
- `transcripts/` - Sample execution runs (Part B)
- `index.html`, `style.css`, `app.js` - A modern, dynamic Web UI built as a bonus.

## How to Run the Web UI (Recommended)

Since the tree is fully deterministic and runs in the browser, you just need a simple local server to bypass CORS restrictions when fetching the JSON file.

1. Open a terminal in this directory (`e:\ProjectA`).
2. Run the following Python command to start a lightweight web server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`.

## How to Run the CLI Agent

You can also run the deterministic tree directly in your terminal using the Python agent.

1. Open a terminal in this directory (`e:\ProjectA`).
2. Run the agent:
   ```bash
   python agent/reflection_agent.py
   ```
3. (Optional) Run an automated test path by providing comma-separated choices (1-indexed):
   ```bash
   python agent/reflection_agent.py --auto 1,2,3,4,1,2,3
   ```
