import MarkdownIt from "markdown-it";
import slugifyTitle from "./slugify";

export const titleAnchorPreprocessor = (md: MarkdownIt) => {
    md.core.ruler.before('normalize', 'title-anchor', (state) => {
        const lines = state.src.split("\n");
        let inCodeBlock = false;
        const processedLines = lines.map((line) => {
            if (line.startsWith("```")) {
                inCodeBlock = !inCodeBlock;
            }
            if (inCodeBlock) {
                return line;
            }
            if (line.startsWith("#")) {
                const title = line.replace(new RegExp("#", "g"), "");
                const processedTitle = (line.includes("{") && line.includes("}")) ?
                    extractAnchor(title) : slugifyTitle(title);
                return `

<TitleAnchor anchor="${processedTitle}">

${line}

</TitleAnchor>

`;
            } else {
                return line;
            }
        });
        state.src = processedLines.join("\n");
    });
}

function extractAnchor(title: string): string {
    return title.split("{")[1].split("}")[0];
}