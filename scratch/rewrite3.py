import bs4
import re
from pathlib import Path

file_path = Path("local-bjj-tournaments-for-parents.html")
html_content = file_path.read_text(encoding="utf-8")

js_logic = """
    document.addEventListener("DOMContentLoaded", () => {
      const grid = document.getElementById("tournament-grid");
      const filters = document.getElementById("tournament-filters");
      const nowNY = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
      
      let validEvents = [];
      let schemaEvents = [];
      
      TOURNAMENT_DATA.forEach((event, index) => {
        // Parse date
        const eventDate = new Date(event.dateString + " 12:00:00");
        const daysAway = Math.ceil((eventDate - nowNY) / (1000 * 60 * 60 * 24));
        
        // Archive passed events
        if (daysAway < -1) return;
        
        // Days away text
        let daysText = daysAway === 0 ? "Today" : (daysAway === 1 ? "Tomorrow" : `${daysAway} days away`);
        if (daysAway < 0) daysText = "Yesterday";
        
        event.daysAway = daysAway;
        event.daysText = daysText;
        validEvents.push(event);
        
        // Schema
        schemaEvents.push({
          "@type": "SportsEvent",
          "name": event.title,
          "description": event.description,
          "startDate": eventDate.toISOString().split("T")[0],
          "location": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": event.location
            }
          },
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "eventStatus": "https://schema.org/EventScheduled",
          "url": event.url
        });
      });
      
      // Generate JSON-LD Schema
      const schemaScript = document.createElement("script");
      schemaScript.type = "application/ld+json";
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": schemaEvents.map((ev, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": ev
        }))
      });
      document.head.appendChild(schemaScript);
      
      // Render grid
      function renderGrid(filter = "all") {
        grid.innerHTML = "";
        let count = 0;
        
        validEvents.forEach((ev, i) => {
          if (filter !== "all" && !ev.type.includes(filter)) return;
          count++;
          
          const smsBody = encodeURIComponent(`Hi Sandy, I'm considering the ${ev.title} for my child. Is this a good fit?`);
          const smsLink = `sms:+19177368649?body=${smsBody}`;
          
          const cardHTML = `
            <article class="he-bezel-outer he-reveal is-visible" style="transition-delay: ${count * 50}ms;">
              <div class="he-bezel-inner he-card-hover" style="padding: 1.5rem;">
                <a href="${ev.url}" target="_blank" rel="noopener noreferrer" class="he-stretched-link" aria-label="View ${ev.title}"></a>
                
                <div class="d-flex justify-content-between align-items-start mb-3 gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--ss-surface2, #F4F1ED); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--ss-slate, #306061); border: 1px solid rgba(0,0,0,0.05);">
                      <i class="bi bi-trophy-fill fs-5"></i>
                    </div>
                    <div>
                      <h3 class="h6 mb-0 fw-bold" style="color: var(--ss-ink, #362B24); font-family: var(--font-body); line-height: 1.25;">${ev.title}</h3>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <span class="badge ${ev.badgeClass}" style="border-radius: 2rem; padding: 0.35rem 0.6rem; font-family: var(--font-ui); font-size: 0.72rem;">${ev.badgeText}</span>
                </div>
                
                <p class="small text-muted mb-4 flex-grow-1" style="line-height: 1.5;">${ev.description}</p>
                
                <div class="mt-auto pt-3 border-top d-flex align-items-center justify-content-between gap-2" style="border-color: rgba(0,0,0,0.06) !important;">
                  <div>
                    <div class="small fw-bold text-dark mb-1 d-flex align-items-center gap-1"><i class="bi bi-calendar-event"></i> ${ev.dateString}</div>
                    <div class="small text-muted d-flex align-items-center gap-1"><i class="bi bi-geo-alt"></i> ${ev.location}</div>
                  </div>
                  <div class="text-end">
                    <span class="he-days-badge mb-2">${ev.daysText}</span>
                  </div>
                </div>
                
                <!-- CTA -->
                <div class="mt-3 pt-3">
                  <a href="${smsLink}" class="he-cta-pill he-nested-btn w-100 justify-content-between" style="padding: 0.4rem 0.4rem 0.4rem 1.25rem;">
                    <span style="font-size: 0.85rem;">Ask Sandy</span>
                    <div class="he-cta-icon-wrapper" style="width: 2rem; height: 2rem;">
                      <i class="bi bi-chat-text-fill"></i>
                    </div>
                  </a>
                </div>
              </div>
            </article>
          `;
          grid.insertAdjacentHTML("beforeend", cardHTML);
        });
        
        if (count === 0) {
          grid.innerHTML = `<div class="col-12 text-center p-5 text-muted">No upcoming events match this filter.</div>`;
        }
      }
      
      // Filtering logic
      if (filters) {
        const buttons = filters.querySelectorAll("button[data-tournament-filter]");
        buttons.forEach(btn => {
          btn.addEventListener("click", () => {
            buttons.forEach(b => {
              b.classList.remove("btn-dark");
              b.classList.add("btn-outline-dark");
            });
            btn.classList.add("btn-dark");
            btn.classList.remove("btn-outline-dark");
            
            const filter = btn.getAttribute("data-tournament-filter");
            renderGrid(filter);
          });
        });
      }
      
      renderGrid("all");
      
      // Intersection Observer for scroll animations
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll(".he-reveal").forEach(el => {
        el.classList.remove("is-visible"); // Ensure they are hidden before observing
        observer.observe(el);
      });
      
    });
  </script>
"""

# Append JS after TOURNAMENT_DATA
html_content = html_content.replace("const TOURNAMENT_DATA = {\n", "const TOURNAMENT_DATA = ")
html_content = html_content.replace("  </script>\n<!--#include virtual=\"/cta-footer.html\" -->", js_logic + "<!--#include virtual=\"/cta-footer.html\" -->")

with open("local-bjj-tournaments-for-parents.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Injected JS logic.")
