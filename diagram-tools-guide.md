# Code-to-Diagram Generation Tools

## 1. VS Code Extensions

### PlantUML Extension
```bash
# Install PlantUML extension
# Then create .puml files with your diagrams
```

### Mermaid Preview
```bash
# Install "Mermaid Preview" extension
# Create .mermaid or .md files with mermaid syntax
```

### Code Map Extension
```bash
# Generates visual code maps automatically
# Shows function relationships and dependencies
```

## 2. Online Tools

### Mermaid Live Editor
- URL: https://mermaid.live/
- Paste mermaid syntax and get instant diagrams
- Export as PNG, SVG, PDF

### Draw.io (now diagrams.net)
- URL: https://app.diagrams.net/
- Manual diagram creation with templates
- Supports UML, flowcharts, etc.

### Lucidchart
- URL: https://www.lucidchart.com/
- Professional diagramming tool
- Has code import features

## 3. Command Line Tools

### Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.mmd -o output.png
```

### PlantUML CLI
```bash
# Download plantuml.jar
java -jar plantuml.jar diagram.puml
```

## 4. Automated Code Analysis Tools

### Madge (JavaScript Dependencies)
```bash
npm install -g madge
madge --image deps.png src/
```

### Dependency Cruiser
```bash
npm install -g dependency-cruiser
depcruise --output-type dot src | dot -T svg > dependencies.svg
```

### JSDoc with Diagrams
```bash
npm install -g jsdoc
# Add @mermaid tags in comments
```

## 5. React-Specific Tools

### React Component Tree
```bash
npm install -g @storybook/addon-docs
# Generates component hierarchy
```

### React Flow Diagrams
```bash
npm install reactflow
# Create interactive diagrams in React
```
