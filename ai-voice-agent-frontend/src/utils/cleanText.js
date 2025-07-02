export function cleanText(text) {
    return text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.,!?]/g, "")
    .trim();
}