/* assets/js/ss-evidence-accordion.js */

(function () {
  const registry = window.SS_EVIDENCE_REGISTRY;
  if (!registry) return;

  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const sourceIds = registry.pageMap[currentPath] || registry.pageMap["/"] || [];
  const sources = sourceIds
    .map((id) => registry.sources[id])
    .filter(Boolean);

  if (!sources.length) return;

  // Mount logic: find [data-ss-evidence-mount] or fall back to standard CTA mount points
  const mount =
    document.querySelector("[data-ss-evidence-mount]") ||
    document.querySelector(".final-cta, #final-cta, [data-final-cta]");

  if (!mount) return;

  const section = document.createElement("section");
  section.className = "ss-evidence";
  section.setAttribute("aria-labelledby", "evidence-title");

  const container = document.createElement("div");
  container.className = "container";

  const header = document.createElement("div");
  header.className = "ss-evidence__header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Links";

  const title = document.createElement("h2");
  title.id = "evidence-title";
  title.textContent = "Further Reading";

  const description = document.createElement("p");
  description.textContent =
    "These links support the health, safety, confidence, and training claims made on this page.";

  header.appendChild(eyebrow);
  header.appendChild(title);
  header.appendChild(description);

  const accordion = document.createElement("div");
  accordion.className = "accordion ss-evidence-accordion";
  accordion.id = "evidenceAccordion";

  sources.forEach((source, index) => {
    const collapseId = `evidence-collapse-${index + 1}`;
    const headingId = `evidence-heading-${index + 1}`;

    const item = document.createElement("div");
    item.className = "accordion-item";

    const h3 = document.createElement("h3");
    h3.className = "accordion-header";
    h3.id = headingId;

    const button = document.createElement("button");
    button.className = "accordion-button collapsed";
    button.type = "button";
    button.setAttribute("data-bs-toggle", "collapse");
    button.setAttribute("data-bs-target", `#${collapseId}`);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", collapseId);
    button.textContent = String(source.title || "");

    h3.appendChild(button);

    const collapse = document.createElement("div");
    collapse.id = collapseId;
    collapse.className = "accordion-collapse collapse";
    collapse.setAttribute("aria-labelledby", headingId);
    collapse.setAttribute("data-bs-parent", "#evidenceAccordion");

    const body = document.createElement("div");
    body.className = "accordion-body";

    const fact = document.createElement("p");
    fact.className = "ss-evidence-fact";

    const factLabel = document.createElement("strong");
    factLabel.textContent = "Quotable fact:";
    fact.appendChild(factLabel);
    fact.appendChild(document.createTextNode(` ${String(source.fact || "")}`));
    body.appendChild(fact);

    const href = safeHref(source && source.url);
    if (href) {
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.textContent = "View source";
      body.appendChild(link);
    }

    collapse.appendChild(body);
    item.appendChild(h3);
    item.appendChild(collapse);
    accordion.appendChild(item);
  });

  container.appendChild(header);
  container.appendChild(accordion);
  section.appendChild(container);

  // Insert above the mount point
  mount.parentNode.insertBefore(section, mount);

  function safeHref(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("/")) return trimmed;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return "";
  }
})();
