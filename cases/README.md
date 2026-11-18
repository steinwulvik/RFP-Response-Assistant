# Cases

Each folder is one RFP. To run the pipeline on a new RFP:

1. Copy `example/` to a new folder, for example `my-rfp/`.
2. Put the files in the subfolders: the buyer's public material in `customer/` (optional), the RFP and all appendices with requirements in `rfp/`, and the supplier's product documentation or answer library in `capabilities/`. Supported formats: PDF, Word (.docx), Markdown and text. Scanned PDFs need OCR first.
3. List the files in `case.json`.
4. Run `node pipeline/run.cjs --model claude --case my-rfp`. Results are written to `results/my-rfp/claude/`.

Only use real RFPs and internal product material in an environment approved for that data, or anonymise names first. Real case folders are excluded from version control (see `.gitignore`); only `example/` is published.

The `example/` case is the fictional Morild Bank RFP as Word files, to show that PDF and Word input works.
