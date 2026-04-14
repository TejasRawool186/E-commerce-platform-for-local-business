@echo off
echo Generating Use Case Diagrams for Local B2B...

REM Create diagrams directory if it doesn't exist
if not exist "diagrams" mkdir diagrams

echo.
echo Option 1: Using Mermaid (requires mermaid-cli)
echo To install: npm install -g @mermaid-js/mermaid-cli
echo Command: mmdc -i diagrams/local-b2b-usecase.mmd -o diagrams/local-b2b-usecase.png

echo.
echo Option 2: Using PlantUML (requires Java and plantuml.jar)
echo Download plantuml.jar from: https://plantuml.com/download
echo Command: java -jar plantuml.jar diagrams/local-b2b-usecase-traditional.puml

echo.
echo Option 3: Online Tools
echo 1. Mermaid Live Editor: https://mermaid.live/
echo    - Copy content from diagrams/local-b2b-usecase.mmd
echo    - Paste and export as PNG/SVG
echo.
echo 2. PlantUML Online: https://www.plantuml.com/plantuml/uml/
echo    - Copy content from diagrams/local-b2b-usecase-traditional.puml
echo    - Generate and download diagram

echo.
echo Files created:
echo - diagrams/local-b2b-usecase.mmd (Mermaid format)
echo - diagrams/local-b2b-usecase-traditional.puml (PlantUML format)

pause
