        (function () {
            const TEMPLATE_PAYLOAD_KEY = "scsr_template_payload_v1";
            const EXPORT_READY_ATTR = "data-csr-export-ready";
            const BACKGROUND_CONTINUATION_HEADING_BUFFER_PX = 18;
            const BACKGROUND_PROTECTED_START_MIN_OPENING_LINES = 2;
            const NARRATIVE_SPLIT_BUFFER_PX = 6;
            const NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX = 2;
            const NARRATIVE_PARAGRAPH_MARGIN = "0 0 0.18rem 0";
            const PAGE_PARAMS = new URLSearchParams(window.location.search);
            const IS_PRINT_MODE = PAGE_PARAMS.get("printMode") === "1";
            window.__CSR_EXPORT_READY__ = false;
            window.__CSR_EXPORT_RENDER_SEQ__ = 0;
            window.__CSR_PRINT_MODE__ = IS_PRINT_MODE;
            if (document && document.documentElement) {
                document.documentElement.setAttribute(EXPORT_READY_ATTR, "0");
                if (IS_PRINT_MODE) {
                    document.documentElement.setAttribute("data-print-mode", "1");
                }
            }

            function setExportRenderReady(isReady) {
                const ready = !!isReady;
                window.__CSR_EXPORT_READY__ = ready;
                if (document && document.documentElement) {
                    document.documentElement.setAttribute(EXPORT_READY_ATTR, ready ? "1" : "0");
                }
            }

            function installZoomGuards() {
                const isZoomShortcut = (event) => {
                    const ctrlOrMeta = !!(event && (event.ctrlKey || event.metaKey));
                    if (!ctrlOrMeta) {
                        return false;
                    }
                    const key = String((event && event.key) || "").toLowerCase();
                    const code = String((event && event.code) || "").toLowerCase();
                    return (
                        key === "+" ||
                        key === "=" ||
                        key === "-" ||
                        key === "_" ||
                        key === "0" ||
                        code === "numpadadd" ||
                        code === "numpadsubtract" ||
                        code === "digit0" ||
                        code === "numpad0"
                    );
                };

                window.addEventListener("keydown", (event) => {
                    if (isZoomShortcut(event)) {
                        event.preventDefault();
                    }
                });

                window.addEventListener(
                    "wheel",
                    (event) => {
                        if (event && event.ctrlKey) {
                            event.preventDefault();
                        }
                    },
                    { passive: false }
                );
            }

            function nextFrame() {
                return new Promise((resolve) => {
                    window.requestAnimationFrame(() => resolve());
                });
            }

            installZoomGuards();

            async function markRenderSettled(renderSeq) {
                await nextFrame();
                await nextFrame();
                if (renderSeq !== window.__CSR_EXPORT_RENDER_SEQ__) {
                    return;
                }
                setExportRenderReady(true);
            }

            function text(value, fallback) {
                const normalized = String(value == null ? "" : value).trim();
                const candidate = normalized || String(fallback == null ? "" : fallback).trim();
                if (!candidate) {
                    return "";
                }
                const upper = candidate.toUpperCase();
                if (upper === "NONE" || upper === "N/A" || upper === "NA") {
                    return "None";
                }
                return candidate;
            }

            function toTitleCaseDisplay(value) {
                const source = String(value == null ? "" : value).trim();
                if (!source) {
                    return "";
                }
                return source
                    .toLowerCase()
                    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
            }

            function escapeHtml(value) {
                return String(value == null ? "" : value)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }

            function formatIsoDate(value) {
                const iso = text(value);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                    return iso;
                }
                const parsed = new Date(iso + "T00:00:00");
                if (Number.isNaN(parsed.getTime())) {
                    return iso;
                }
                return parsed.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Manila",
                });
            }

            function formatFamilyBirthday(value) {
                const raw = text(value);
                let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (match) {
                    return match[2] + "/" + match[3] + "/" + match[1];
                }
                match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (!match) {
                    return raw;
                }
                return match[1].padStart(2, "0") + "/" + match[2].padStart(2, "0") + "/" + match[3];
            }

            function formatPesoDisplay(value) {
                const raw = text(value);
                if (!raw) {
                    return "";
                }
                const cleaned = raw.replace(/₱/g, "").replace(/\s+/g, "").replace(/[^0-9.,]/g, "");
                if (!cleaned) {
                    return raw;
                }
                const hasDot = cleaned.includes(".");
                const hasComma = cleaned.includes(",");
                const isThousandsGrouping = (separator) => {
                    const parts = cleaned.split(separator);
                    if (parts.length <= 1) {
                        return false;
                    }
                    const head = parts[0].replace(/\D/g, "");
                    if (!head || head.length > 3) {
                        return false;
                    }
                    return parts.slice(1).every((part) => /^\d{3}$/.test(part));
                };
                let separatorIndex = -1;
                let hasDecimal = false;
                if (hasDot && hasComma) {
                    separatorIndex = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
                    hasDecimal = true;
                } else if (hasDot || hasComma) {
                    const separator = hasDot ? "." : ",";
                    separatorIndex = cleaned.lastIndexOf(separator);
                    const digitsAfter = cleaned.length - separatorIndex - 1;
                    hasDecimal = digitsAfter <= 2 && !isThousandsGrouping(separator);
                }
                const integerPart = hasDecimal && separatorIndex >= 0
                    ? cleaned.slice(0, separatorIndex).replace(/[.,]/g, "")
                    : cleaned.replace(/[.,]/g, "");
                const decimalPart = hasDecimal && separatorIndex >= 0
                    ? cleaned.slice(separatorIndex + 1).replace(/[.,]/g, "").slice(0, 2)
                    : "";
                const normalized = decimalPart
                    ? (integerPart || "0") + "." + decimalPart
                    : integerPart;
                const parsed = Number.parseFloat(normalized);
                if (!Number.isFinite(parsed)) {
                    return raw;
                }
                return "₱" + parsed.toLocaleString("en-PH", {
                    minimumFractionDigits: decimalPart ? 2 : 0,
                    maximumFractionDigits: 2,
                });
            }

            async function readPayload() {
                try {
                    const params = new URLSearchParams(window.location.search);
                    const exportToken = params.get("exportToken");
                    if (exportToken) {
                        const response = await fetch("/api/export/payload?token=" + encodeURIComponent(exportToken), {
                            method: "GET",
                            headers: { "Accept": "application/json" },
                        });
                        if (response.ok) {
                            const result = await response.json();
                            const payload = result && result.payload;
                            if (payload && typeof payload === "object") {
                                return payload;
                            }
                        }
                    }
                } catch (_) {
                    // Fall back to storage payload.
                }
                const rawSession = window.sessionStorage.getItem(TEMPLATE_PAYLOAD_KEY);
                const rawLocal = window.localStorage.getItem(TEMPLATE_PAYLOAD_KEY);
                const raw = rawSession || rawLocal;
                if (!raw) {
                    return null;
                }
                try {
                    const parsed = JSON.parse(raw);
                    return parsed && typeof parsed === "object" ? parsed : null;
                } catch (_) {
                    return null;
                }
            }

            function setField(fieldName, value) {
                const nodes = document.querySelectorAll("[data-csr-field=\"" + fieldName + "\"]");
                nodes.forEach((node) => {
                    node.textContent = text(value, node.textContent);
                });
            }

            const pageRoot = document.querySelector("body > .flex-grow");
            const basePages = pageRoot ? Array.from(pageRoot.querySelectorAll(".page-container")) : [];
            const pageOne = basePages[0] || null;
            const pageTwoTemplate = basePages[1] ? basePages[1].cloneNode(true) : null;
            const pageThreeTemplate = basePages[2] ? basePages[2].cloneNode(true) : null;
            const pageFourTemplate = basePages[3] ? basePages[3].cloneNode(true) : null;
            [pageTwoTemplate, pageThreeTemplate, pageFourTemplate].forEach((page) => {
                if (page) {
                    page.classList.add("template-page", "hidden");
                }
            });
            basePages.slice(1).forEach((page) => {
                if (page && page.parentNode) {
                    page.parentNode.removeChild(page);
                }
            });

            function buildFamilyRowHtml(row) {
                const monitoredYes = text(row && row.monitoredChild).toUpperCase() === "YES";
                const nameDisplay = toTitleCaseDisplay(text(row && row.name, "N/A"));
                const sexDisplay = toTitleCaseDisplay(text(row && row.sex, "N/A"));
                const educationalAttainmentDisplay = toTitleCaseDisplay(text(row && row.educationalAttainment, "N/A"));
                const monthlyIncome = text(row && row.monthlyIncome, "N/A");
                const disabilityType = text(row && row.disabilityType, "N/A");
                const monthlyIncomeDisplay = monthlyIncome.toUpperCase() === "NONE" ? "N/A" : monthlyIncome;
                const disabilityTypeDisplay = disabilityType.toUpperCase() === "NONE" ? "N/A" : disabilityType;
                return "<tr>" +
                    "<td class=\"border border-black\">" + escapeHtml(nameDisplay) + "</td>" +
                    "<td class=\"border border-black text-center\">" + escapeHtml(sexDisplay) + "</td>" +
                    "<td class=\"border border-black text-center\">" + escapeHtml(text(row && row.age, "N/A")) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(formatFamilyBirthday(row && row.birthday)) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(text(row && row.relationship, "N/A")) + "</td>" +
                    "<td class=\"border border-black text-center font-bold\">" + (monitoredYes ? "&#10003;" : "") + "</td>" +
                    "<td class=\"border border-black text-center\">" + (!monitoredYes ? "&#10003;" : "") + "</td>" +
                    "<td class=\"border border-black text-[10pt]\">" + escapeHtml(educationalAttainmentDisplay) + "</td>" +
                    "<td class=\"border border-black text-[10pt]\">" + escapeHtml(text(row && row.occupation, "N/A")) + "</td>" +
                    "<td class=\"border border-black text-right\">" + escapeHtml(monthlyIncomeDisplay) + "</td>" +
                    "<td class=\"border border-black\">" + escapeHtml(disabilityTypeDisplay) + "</td>" +
                    "</tr>";
            }

            function createFamilySection(rows, isContinuation, rowsOnly) {
                const section = document.createElement("div");
                section.className = "mb-2 pl-0 w-full";
                section.setAttribute("data-flow-kind", "family");
                const title = isContinuation
                    ? "II. Family Composition (cont.)"
                    : "II. Family Composition";
                section.innerHTML =
                    (rowsOnly
                        ? ""
                        : "<h2 class=\"font-bold text-[12pt] mb-2 uppercase\">" + title + "</h2>") +
                    "<div class=\"w-full\">" +
                    "<table class=\"report-table family-composition-table text-left border-black\">" +
                    "<colgroup>" +
                    "<col class=\"col-name\" /><col class=\"col-sex\" /><col class=\"col-age\" /><col class=\"col-civil\" /><col class=\"col-rel\" />" +
                    "<col class=\"col-check\" /><col class=\"col-check\" />" +
                    "<col class=\"col-educ\" /><col class=\"col-occup\" /><col class=\"col-income\" /><col class=\"col-disability\" />" +
                    "</colgroup>" +
                    (rowsOnly
                        ? ""
                        : "<thead><tr>" +
                        "<th class=\"border border-black\">Name</th><th class=\"border border-black\">Sex</th><th class=\"border border-black\">Age</th>" +
                        "<th class=\"border border-black\">Birthday</th><th class=\"border border-black\">Relationship to the Client</th>" +
                        "<th class=\"border border-black p-0\" colspan=\"2\"><div class=\"w-full h-full flex flex-col\"><div class=\"border-b border-black p-1 text-[9pt]\">Monitored Child</div><div class=\"flex h-full\"><div class=\"w-1/2 border-r border-black p-0.5\">Yes</div><div class=\"w-1/2 p-0.5\">No</div></div></div></th>" +
                        "<th class=\"border border-black\">Educ. Attainment</th><th class=\"border border-black\">Occupation</th><th class=\"border border-black\">Monthly Income</th><th class=\"border border-black\">Type of Disability(if applicable)</th>" +
                        "</tr></thead>") +
                    "<tbody></tbody></table></div>";
                const tbody = section.querySelector("tbody");
                (rows || []).forEach((row) => {
                    tbody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(row));
                });
                return section;
            }

            function isPageOverflowing(page) {
                const wrapper = page && page.querySelector(".content-wrapper");
                if (!wrapper) {
                    return false;
                }
                // Footer is fixed and consistent, so we only check content-box overflow.
                // Keep tolerance minimal; row-fit checks handle the final decision.
                const tolerancePx = 2;
                return wrapper.scrollHeight > (wrapper.clientHeight + tolerancePx);
            }

            function isLastRowOverFooter(page, tbody) {
                const footer = page && page.querySelector(".footer-section");
                const lastRow = tbody && tbody.lastElementChild;
                if (!footer || !lastRow) {
                    return false;
                }
                const footerTop = footer.getBoundingClientRect().top;
                const rowBottom = lastRow.getBoundingClientRect().bottom;
                return rowBottom > (footerTop - 2);
            }

            function isNodeOverFooter(page, node, paddingPx) {
                const footer = page && page.querySelector(".footer-section");
                if (!footer || !node) {
                    return false;
                }
                const pad = typeof paddingPx === "number" ? paddingPx : 2;
                const footerTop = footer.getBoundingClientRect().top;
                const nodeBottom = node.getBoundingClientRect().bottom;
                return nodeBottom > (footerTop - pad);
            }

            function getTextLineRects(node) {
                if (!node || !document || typeof document.createRange !== "function") {
                    return [];
                }
                const range = document.createRange();
                range.selectNodeContents(node);
                const rects = Array.from(range.getClientRects()).filter((rect) => {
                    return rect.width > 0 && rect.height > 0;
                });
                if (typeof range.detach === "function") {
                    range.detach();
                }
                return rects;
            }

            function isParagraphTextOverFooter(page, node, paddingPx) {
                const footer = page && page.querySelector(".footer-section");
                if (!footer || !node) {
                    return false;
                }
                const rects = getTextLineRects(node);
                if (!rects.length) {
                    return isNodeOverFooter(page, node, paddingPx);
                }
                const pad = typeof paddingPx === "number" ? paddingPx : 2;
                const footerTop = footer.getBoundingClientRect().top;
                const lastLine = rects[rects.length - 1];
                return lastLine.bottom > (footerTop - pad);
            }

            function isNodeStartNearFooter(page, node, bufferPx) {
                const footer = page && page.querySelector(".footer-section");
                if (!footer || !node) {
                    return false;
                }
                const buffer = typeof bufferPx === "number" ? bufferPx : 56;
                const footerTop = footer.getBoundingClientRect().top;
                const nodeTop = node.getBoundingClientRect().top;
                return nodeTop >= (footerTop - buffer);
            }

            function isNodeEndNearFooter(page, node, bufferPx) {
                const footer = page && page.querySelector(".footer-section");
                if (!footer || !node) {
                    return false;
                }
                const buffer = typeof bufferPx === "number" ? bufferPx : 56;
                const footerTop = footer.getBoundingClientRect().top;
                const nodeBottom = node.getBoundingClientRect().bottom;
                return nodeBottom >= (footerTop - buffer);
            }

            function removeGeneratedDynamicPages() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".generated-dynamic-page")).forEach((node) => {
                    node.remove();
                });
            }

            function clearPageOneDynamicFlowSections() {
                if (!pageOne) {
                    return;
                }
                const host = getFlowHost(pageOne);
                if (!host) {
                    return;
                }
                const selectors = [
                    "[data-flow-kind=\"case\"]",
                    "[data-flow-kind=\"background\"]",
                    "[data-flow-kind=\"assessment\"]",
                    "[data-flow-kind=\"plan\"]",
                    "[data-flow-kind=\"evaluation\"]",
                    "[data-flow-kind=\"recommendation\"]",
                ];
                Array.from(host.querySelectorAll(selectors.join(","))).forEach((node) => {
                    node.remove();
                });
            }

            function syncPageContentHeight(page) {
                const wrapper = page && page.querySelector(".content-wrapper");
                const footer = page && page.querySelector(".footer-section");
                if (!wrapper || !footer) {
                    return;
                }
                const available = Math.max(0, footer.offsetTop - wrapper.offsetTop - 2);
                wrapper.style.height = available + "px";
            }

            function syncAllPageContentHeights() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".page-container")).forEach((page) => {
                    syncPageContentHeight(page);
                });
            }

            function createDynamicContentPage(templatePage) {
                if (!templatePage) {
                    return null;
                }
                const page = templatePage.cloneNode(true);
                page.classList.remove("hidden");
                page.classList.remove("template-page");
                page.classList.add("generated-dynamic-page");
                pageRoot.appendChild(page);
                syncPageContentHeight(page);
                return page;
            }

            function extractNarrativeBlocksFromHtml(html, options) {
                const container = document.createElement("div");
                container.innerHTML = text(html);
                const settings = options && typeof options === "object" ? options : {};
                const shouldTrimTrailingBreaks = settings.trimTrailingBreaks !== false;
                const shouldCollapseBreaks = settings.collapseConsecutiveBreaks !== false;

                function normalizeNarrativeNodeStyles(node) {
                    if (!node || node.nodeType !== 1) {
                        return;
                    }
                    [
                        "font-size",
                        "font-family",
                        "line-height",
                        "letter-spacing",
                        "word-spacing",
                        "text-indent",
                    ].forEach((property) => {
                        node.style.removeProperty(property);
                    });
                    Array.from(node.children || []).forEach((child) => {
                        normalizeNarrativeNodeStyles(child);
                    });
                }

                function isTrailingEmptyNode(node) {
                    if (!node) {
                        return true;
                    }
                    if (node.nodeType === 3) {
                        return !String(node.textContent || "").replace(/[\u00A0\s]+/g, "");
                    }
                    if (node.nodeType !== 1) {
                        return true;
                    }
                    const tag = String(node.tagName || "").toUpperCase();
                    if (tag === "BR") {
                        return true;
                    }
                    const children = Array.from(node.childNodes || []);
                    if (!children.length) {
                        return !String(node.textContent || "").replace(/[\u00A0\s]+/g, "");
                    }
                    return children.every((child) => isTrailingEmptyNode(child));
                }

                function trimTrailingLineBreaks(node) {
                    if (!node || !node.childNodes || node.childNodes.length === 0) {
                        return;
                    }
                    let cursor = node.lastChild;
                    while (cursor) {
                        if (cursor.nodeType === 3) {
                            const rawText = String(cursor.textContent || "");
                            const trimmedText = rawText.replace(/[\u00A0\s]+$/, "");
                            if (!trimmedText) {
                                const previous = cursor.previousSibling;
                                cursor.remove();
                                cursor = previous;
                                continue;
                            }
                            if (trimmedText !== rawText) {
                                cursor.textContent = trimmedText;
                            }
                            break;
                        }
                        if (isTrailingEmptyNode(cursor)) {
                            const previous = cursor.previousSibling;
                            cursor.remove();
                            cursor = previous;
                            continue;
                        }
                        if (cursor.nodeType === 1) {
                            trimTrailingLineBreaks(cursor);
                            if (isTrailingEmptyNode(cursor)) {
                                const previous = cursor.previousSibling;
                                cursor.remove();
                                cursor = previous;
                                continue;
                            }
                        }
                        break;
                    }
                }

                function collapseConsecutiveLineBreaks(node) {
                    if (!node || !node.childNodes || node.childNodes.length === 0) {
                        return;
                    }
                    let previousWasBreak = false;
                    Array.from(node.childNodes).forEach((child) => {
                        if (child.nodeType === 1) {
                            collapseConsecutiveLineBreaks(child);
                        }
                        const isBreak =
                            child.nodeType === 1 &&
                            String(child.tagName || "").toUpperCase() === "BR";
                        if (isBreak && previousWasBreak) {
                            child.remove();
                            return;
                        }
                        previousWasBreak = isBreak;
                        if (!isBreak) {
                            previousWasBreak = false;
                        }
                    });
                }

                function splitParagraphLikeNode(node) {
                    const raw = text(node && node.textContent).replace(/\s+/g, " ").trim();
                    if (!raw) {
                        return [];
                    }
                    const cloned = document.createElement("p");
                    cloned.textContent = raw;
                    cloned.classList.add("case-dev-paragraph");
                    cloned.style.margin = NARRATIVE_PARAGRAPH_MARGIN;
                    cloned.style.textIndent = "1.27cm";
                    return [cloned];
                }

                function collectAtomicBlocks(node, out) {
                    if (!node) {
                        return;
                    }
                    if (node.nodeType === 3) {
                        const value = text(node.textContent).replace(/\s+/g, " ").trim();
                        if (!value) {
                            return;
                        }
                        const p = document.createElement("p");
                        p.textContent = value;
                        p.classList.add("case-dev-paragraph");
                        p.style.margin = NARRATIVE_PARAGRAPH_MARGIN;
                        p.style.textIndent = "1.27cm";
                        out.push(p);
                        return;
                    }
                    if (node.nodeType !== 1) {
                        return;
                    }
                    const tag = (node.tagName || "").toUpperCase();
                    const isWrapper = tag === "DIV" || tag === "SECTION" || tag === "ARTICLE";
                    if (isWrapper && node.children.length) {
                        Array.from(node.childNodes).forEach((child) => {
                            collectAtomicBlocks(child, out);
                        });
                        return;
                    }
                    if (tag === "P") {
                        const cloned = node.cloneNode(true);
                        normalizeNarrativeNodeStyles(cloned);
                        if (shouldTrimTrailingBreaks) {
                            trimTrailingLineBreaks(cloned);
                        }
                        if (shouldCollapseBreaks) {
                            collapseConsecutiveLineBreaks(cloned);
                        }
                        cloned.classList.add("case-dev-paragraph");
                        cloned.style.margin = NARRATIVE_PARAGRAPH_MARGIN;
                        cloned.style.textIndent = "1.27cm";
                        out.push(cloned);
                        return;
                    }
                    if (tag !== "TABLE" && tag !== "TBODY" && tag !== "THEAD" && tag !== "TR" && tag !== "TD" &&
                        tag !== "TH" && tag !== "UL" && tag !== "OL" && tag !== "LI" &&
                        text(node.textContent).trim().length > 0) {
                        const chunks = splitParagraphLikeNode(node);
                        chunks.forEach((chunkNode) => out.push(chunkNode));
                        return;
                    }
                    if (node.children.length === 0 && text(node.textContent).trim().length > 0) {
                        const chunks = splitParagraphLikeNode(node);
                        chunks.forEach((chunkNode) => out.push(chunkNode));
                        return;
                    }
                    if (text(node.textContent).trim().length === 0) {
                        return;
                    }
                    const cloned = node.cloneNode(true);
                    normalizeNarrativeNodeStyles(cloned);
                    if (cloned && cloned.nodeType === 1 && String(cloned.tagName || "").toUpperCase() === "P") {
                        cloned.classList.add("case-dev-paragraph");
                        if (!cloned.style.margin) {
                            cloned.style.margin = NARRATIVE_PARAGRAPH_MARGIN;
                        }
                        cloned.style.textIndent = "1.27cm";
                    }
                    out.push(cloned);
                }

                const blocks = [];
                Array.from(container.childNodes).forEach((node) => {
                    collectAtomicBlocks(node, blocks);
                });
                return blocks;
            }

            function getCaseDevelopmentBlocks(payload) {
                return extractNarrativeBlocksFromHtml(
                    payload && payload.presentingProblem && payload.presentingProblem.html
                );
            }

            function collectTextNodes(node) {
                if (!node || !document || typeof document.createTreeWalker !== "function") {
                    return [];
                }
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
                const nodes = [];
                let current = walker.nextNode();
                while (current) {
                    nodes.push(current);
                    current = walker.nextNode();
                }
                return nodes;
            }

            function pruneEmptyInlineNodes(node) {
                if (!node || !node.childNodes) {
                    return;
                }
                Array.from(node.childNodes).forEach((child) => {
                    if (child.nodeType === 1) {
                        pruneEmptyInlineNodes(child);
                        const tag = String(child.tagName || "").toUpperCase();
                        const hasMeaningfulChildren = Array.from(child.childNodes || []).some((grandChild) => {
                            if (grandChild.nodeType === 3) {
                                return /\S/.test(String(grandChild.textContent || ""));
                            }
                            if (grandChild.nodeType !== 1) {
                                return false;
                            }
                            const grandTag = String(grandChild.tagName || "").toUpperCase();
                            return grandTag === "BR" || /\S/.test(String(grandChild.textContent || ""));
                        });
                        if (!hasMeaningfulChildren && tag !== "BR") {
                            child.remove();
                        }
                        return;
                    }
                    if (child.nodeType === 3 && !/\S/.test(String(child.textContent || ""))) {
                        child.remove();
                    }
                });
            }

            function cloneParagraphWithCharacterRange(paragraphNode, startOffset, endOffset) {
                if (!paragraphNode) {
                    return null;
                }
                const rawText = String(paragraphNode.textContent || "");
                const boundedStart = Math.max(0, Math.min(rawText.length, Number(startOffset) || 0));
                const boundedEnd = Math.max(boundedStart, Math.min(rawText.length, Number(endOffset) || 0));
                if (boundedEnd <= boundedStart) {
                    return null;
                }

                const clone = paragraphNode.cloneNode(true);
                const sourceTextNodes = collectTextNodes(paragraphNode);
                const cloneTextNodes = collectTextNodes(clone);
                let cursor = 0;

                for (let index = 0; index < sourceTextNodes.length; index += 1) {
                    const sourceText = String(sourceTextNodes[index] && sourceTextNodes[index].nodeValue || "");
                    const cloneTextNode = cloneTextNodes[index];
                    if (!cloneTextNode) {
                        cursor += sourceText.length;
                        continue;
                    }
                    const nodeStart = cursor;
                    const nodeEnd = cursor + sourceText.length;
                    const sliceStart = Math.max(boundedStart, nodeStart);
                    const sliceEnd = Math.min(boundedEnd, nodeEnd);
                    cloneTextNode.nodeValue = sliceEnd > sliceStart
                        ? sourceText.slice(sliceStart - nodeStart, sliceEnd - nodeStart)
                        : "";
                    cursor = nodeEnd;
                }

                pruneEmptyInlineNodes(clone);
                return /\S/.test(String(clone.textContent || "")) ? clone : null;
            }

            function markParagraphAsContinuation(paragraphNode) {
                if (!paragraphNode || String(paragraphNode.tagName || "").toUpperCase() !== "P") {
                    return paragraphNode;
                }
                paragraphNode.setAttribute("data-paragraph-continuation", "1");
                paragraphNode.classList.add("narrative-paragraph-continuation");
                paragraphNode.style.textIndent = "0";
                return paragraphNode;
            }

            function getNarrativeBlocksFromHtml(html) {
                return extractNarrativeBlocksFromHtml(html);
            }

            function getNarrativeBlocksFromPlainText(value) {
                const raw = String(value == null ? "" : value).replace(/\r\n/g, "\n");
                if (!text(raw)) {
                    return [];
                }
                const paragraphs = raw
                    .split(/\n\s*\n+/)
                    .map((entry) => entry.replace(/\s*\n\s*/g, " ").trim())
                    .filter((entry) => !!entry);
                if (!paragraphs.length) {
                    return [];
                }
                const html = paragraphs
                    .map((paragraph) => "<p>" + escapeHtml(paragraph) + "</p>")
                    .join("");
                return getNarrativeBlocksFromHtml(html);
            }

            function getNormalizedNarrativeHtml(html) {
                return getNarrativeBlocksFromHtml(html)
                    .map((node) => {
                        const wrapper = document.createElement("div");
                        wrapper.appendChild(node.cloneNode(true));
                        return wrapper.innerHTML;
                    })
                    .join("");
            }

            function getBackgroundTabHtml(payload, key) {
                const tabs = Array.isArray(payload && payload.backgroundInformation && payload.backgroundInformation.tabs)
                    ? payload.backgroundInformation.tabs
                    : [];
                const entry = tabs.find((item) => text(item && item.key) === key);
                return text(entry && entry.html);
            }

            function createBackgroundSectionSkeleton(isContinuation) {
                const section = document.createElement("section");
                section.className = "mb-2";
                section.setAttribute("data-flow-kind", "background");
                section.innerHTML =
                    ((isContinuation ? "" : "<div class=\"flex gap-4 mb-2 calibri-font\"><h3 class=\"font-bold text-[12pt]\">IV. BACKGROUND INFORMATION</h3></div>")) +
                    "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                return section;
            }

            function createNarrativeSectionSkeleton(kind, title, isContinuation) {
                const section = document.createElement("section");
                section.className = "mb-2";
                section.setAttribute("data-flow-kind", kind);
                section.innerHTML =
                    ((isContinuation ? "" : "<div class=\"flex gap-4 mb-2 calibri-font\"><h3 class=\"font-bold text-[12pt]\">" + title + "</h3></div>")) +
                    "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                return section;
            }

            function buildBackgroundBlocks(payload) {
                function tightenPreviousNarrativeSpacing() {
                    const previousBlock = blocks.length ? blocks[blocks.length - 1] : null;
                    const isParagraph = String(previousBlock && previousBlock.tagName || "").toUpperCase() === "P";
                    const isHeading = !!(
                        previousBlock &&
                        previousBlock.hasAttribute &&
                        previousBlock.hasAttribute("data-background-heading")
                    );
                    if (isParagraph && !isHeading) {
                        previousBlock.style.marginBottom = "0";
                    }
                }

                const groups = [
                    {
                        heading: "A. The Family",
                        tabs: [
                            { key: "socioEconomic", heading: "Socio-Economic" },
                            { key: "healthCondition", heading: "Health Condition" },
                            { key: "environmentalLivingConditions", heading: "Environmental and Living Condition" },
                        ],
                    },
                    {
                        heading: "B. The Environment / Community",
                        tabs: [{ key: "environmentCommunity", heading: null }],
                    },
                ];

                const blocks = [];
                groups.forEach((group) => {
                    const groupHasContent = group.tabs.some((tab) => text(getBackgroundTabHtml(payload, tab.key)));
                    if (!groupHasContent) {
                        return;
                    }
                    tightenPreviousNarrativeSpacing();
                    const groupHeading = document.createElement("p");
                    groupHeading.textContent = group.heading;
                    groupHeading.className = "font-bold text-[12pt] mb-3";
                    groupHeading.style.margin = "0 0 0.32rem 0";
                    groupHeading.setAttribute("data-background-heading", "1");
                    groupHeading.setAttribute("data-background-group-start", "1");
                    blocks.push(groupHeading);

                    group.tabs.forEach((tab) => {
                        const html = getBackgroundTabHtml(payload, tab.key);
                        if (!text(html)) {
                            return;
                        }
                        if (tab.heading) {
                            tightenPreviousNarrativeSpacing();
                            const subHeading = document.createElement("p");
                            subHeading.textContent = tab.heading;
                            subHeading.className = "font-bold text-[12pt] mb-3";
                            subHeading.style.margin = "0 0 0.32rem 1.27cm";
                            subHeading.setAttribute("data-background-heading", "1");
                            subHeading.setAttribute("data-background-subgroup-start", "1");
                            blocks.push(subHeading);
                        }
                        getNarrativeBlocksFromHtml(html).forEach((block) => blocks.push(block));
                    });
                });
                return blocks;
            }

            function splitCaseParagraphToFitPage(page, caseBody, paragraphNode) {
                if (!page || !caseBody || !paragraphNode) {
                    return null;
                }
                const tag = String(paragraphNode.tagName || "").toUpperCase();
                if (tag !== "P") {
                    return null;
                }
                const rawText = String(paragraphNode.textContent || "");
                const contentStart = rawText.search(/\S/);
                const contentEnd = rawText.search(/\s*$/);
                if (contentStart < 0 || contentEnd <= contentStart) {
                    return null;
                }
                if ((contentEnd - contentStart) < 2) {
                    return null;
                }

                const canFitRange = (candidateEnd) => {
                    const probe = cloneParagraphWithCharacterRange(paragraphNode, contentStart, candidateEnd);
                    if (!probe) {
                        return false;
                    }
                    caseBody.appendChild(probe);
                    const fits = !isParagraphTextOverFooter(
                        page,
                        probe,
                        NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX
                    );
                    probe.remove();
                    return fits;
                };

                let low = contentStart + 1;
                let high = contentEnd - 1;
                let best = 0;

                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    if (!canFitRange(mid)) {
                        high = mid - 1;
                    } else {
                        best = mid;
                        low = mid + 1;
                    }
                }

                if (best <= contentStart || best >= contentEnd) {
                    return null;
                }

                let splitIndex = best;
                while (splitIndex > contentStart && /\S/.test(rawText.charAt(splitIndex))) {
                    splitIndex -= 1;
                }
                if (splitIndex <= contentStart) {
                    splitIndex = best;
                }

                let extendedIndex = splitIndex;
                while (extendedIndex < contentEnd) {
                    const nextWhitespaceMatch = rawText.slice(extendedIndex, contentEnd).match(/\s+\S/);
                    if (!nextWhitespaceMatch) {
                        if (canFitRange(contentEnd)) {
                            extendedIndex = contentEnd;
                        }
                        break;
                    }
                    const nextWordStart =
                        extendedIndex +
                        nextWhitespaceMatch.index +
                        nextWhitespaceMatch[0].search(/\S/);
                    let nextWordEnd = nextWordStart;
                    while (nextWordEnd < contentEnd && /\S/.test(rawText.charAt(nextWordEnd))) {
                        nextWordEnd += 1;
                    }
                    if (!canFitRange(nextWordEnd)) {
                        break;
                    }
                    extendedIndex = nextWordEnd;
                }
                splitIndex = extendedIndex;

                const firstParagraph = cloneParagraphWithCharacterRange(
                    paragraphNode,
                    contentStart,
                    splitIndex
                );
                const remainder = cloneParagraphWithCharacterRange(
                    paragraphNode,
                    splitIndex,
                    contentEnd
                );
                if (!firstParagraph || !remainder) {
                    return null;
                }

                markParagraphAsContinuation(remainder);

                caseBody.appendChild(firstParagraph);
                if (isParagraphTextOverFooter(page, firstParagraph, NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX)) {
                    firstParagraph.remove();
                    return null;
                }
                return remainder;
            }

            function canParagraphStartWithAtLeastOneLine(page, body, paragraphNode) {
                if (!page || !body || !paragraphNode) {
                    return false;
                }
                const tag = String(paragraphNode.tagName || "").toUpperCase();
                if (tag !== "P") {
                    return !isNodeOverFooter(page, paragraphNode);
                }
                const fullText = text(paragraphNode.textContent).replace(/\s+/g, " ").trim();
                if (!fullText) {
                    return false;
                }
                const probe = paragraphNode.cloneNode(true);
                body.appendChild(probe);
                const footer = page.querySelector(".footer-section");
                const footerTop = footer
                    ? footer.getBoundingClientRect().top
                    : page.getBoundingClientRect().bottom;
                const rects = getTextLineRects(probe);
                probe.remove();
                if (!rects.length) {
                    return false;
                }
                const firstLine = rects[0];
                return firstLine.bottom <= footerTop - 2;
            }

            function countParagraphLinesFittingBeforeFooter(page, body, paragraphNode) {
                if (!page || !body || !paragraphNode) {
                    return 0;
                }
                const tag = String(paragraphNode.tagName || "").toUpperCase();
                if (tag !== "P") {
                    return isNodeOverFooter(page, paragraphNode) ? 0 : 1;
                }
                const probe = paragraphNode.cloneNode(true);
                body.appendChild(probe);
                const footer = page.querySelector(".footer-section");
                const footerTop = footer
                    ? footer.getBoundingClientRect().top
                    : page.getBoundingClientRect().bottom;
                const rects = getTextLineRects(probe);
                probe.remove();
                if (!rects.length) {
                    return 0;
                }
                let fitting = 0;
                rects.forEach((rect) => {
                    if (rect.bottom <= footerTop - NARRATIVE_SPLIT_BUFFER_PX) {
                        fitting += 1;
                    }
                });
                return fitting;
            }

            function shouldMoveNarrativeStartBlockToNextPage(page, body, firstNode, minimumOpeningLines) {
                if (!page || !body || !firstNode) {
                    return false;
                }
                const requiredLines = Math.max(1, Number(minimumOpeningLines) || 1);
                if (requiredLines <= 1) {
                    return !canParagraphStartWithAtLeastOneLine(page, body, firstNode);
                }
                return countParagraphLinesFittingBeforeFooter(page, body, firstNode) < requiredLines;
            }

            function getProtectedStartMinimumOpeningLines(page, body, node, preferredLines) {
                if (!page || !body || !node) {
                    return 1;
                }
                const preferred = Math.max(1, Number(preferredLines) || 1);
                const tag = String(node && node.tagName || "").toUpperCase();
                if (tag !== "P") {
                    return 1;
                }
                const probe = node.cloneNode(true);
                body.appendChild(probe);
                const lineCount = getTextLineRects(probe).length;
                probe.remove();
                const totalLines = Math.max(1, lineCount || 1);
                return Math.min(preferred, totalLines);
            }

            function shouldMoveBackgroundStartBlockToNextPage(page, backgroundBody, blocks, startIndex) {
                if (!page || !backgroundBody || !Array.isArray(blocks) || !blocks.length) {
                    return false;
                }
                const startNode = blocks[startIndex];
                if (!startNode) {
                    return false;
                }
                const protectedStartIndex = getBackgroundProtectedStartIndex(blocks, startIndex);
                const startIsHeading =
                    !!(startNode.hasAttribute && startNode.hasAttribute("data-background-heading"));
                const isHeadingStart =
                    startIsHeading &&
                    !!(
                        startNode.hasAttribute("data-background-group-start") ||
                        startNode.hasAttribute("data-background-subgroup-start")
                    );
                const isFirstProtectedContent =
                    !startIsHeading &&
                    isBackgroundFirstContentOfProtectedStart(
                        blocks,
                        protectedStartIndex,
                        startIndex
                    );
                if (!isHeadingStart && !isFirstProtectedContent) {
                    return false;
                }
                const appendedHeadingClones = [];
                let firstContent = null;
                for (let index = protectedStartIndex; index < blocks.length; index += 1) {
                    const node = blocks[index];
                    const isHeading = !!(node && node.hasAttribute && node.hasAttribute("data-background-heading"));
                    if (!isHeading) {
                        firstContent = node;
                        break;
                    }
                    const headingClone = node.cloneNode(true);
                    backgroundBody.appendChild(headingClone);
                    appendedHeadingClones.push(headingClone);
                    if (isNodeOverFooter(page, headingClone)) {
                        appendedHeadingClones.forEach((clone) => clone.remove());
                        return true;
                    }
                }
                if (!firstContent) {
                    appendedHeadingClones.forEach((clone) => clone.remove());
                    return false;
                }
                const requiredOpeningLines = getProtectedStartMinimumOpeningLines(
                    page,
                    backgroundBody,
                    firstContent,
                    BACKGROUND_PROTECTED_START_MIN_OPENING_LINES
                );
                const fittingLines = countParagraphLinesFittingBeforeFooter(
                    page,
                    backgroundBody,
                    firstContent
                );
                appendedHeadingClones.forEach((clone) => clone.remove());
                // Keep heading with opening lines of first paragraph; move the whole protected
                // start only when opening lines would be pushed to next page.
                return fittingLines < requiredOpeningLines;
            }

            function shouldRollbackBackgroundProtectedStartOnOverflow(page, backgroundBody, blocks, protectedStartIndex, currentIndex, node) {
                if (!page || !backgroundBody || !Array.isArray(blocks)) {
                    return false;
                }
                const isProtectedFirstContent =
                    protectedStartIndex < currentIndex ||
                    isBackgroundFirstContentOfProtectedStart(blocks, protectedStartIndex, currentIndex);
                if (!isProtectedFirstContent) {
                    return false;
                }
                const requiredOpeningLines = getProtectedStartMinimumOpeningLines(
                    page,
                    backgroundBody,
                    node,
                    BACKGROUND_PROTECTED_START_MIN_OPENING_LINES
                );
                const fittingLines = countParagraphLinesFittingBeforeFooter(page, backgroundBody, node);
                return fittingLines < requiredOpeningLines;
            }

            function getBackgroundProtectedStartIndex(blocks, startIndex) {
                if (!Array.isArray(blocks) || !blocks.length || startIndex < 0 || startIndex >= blocks.length) {
                    return startIndex;
                }
                const startNode = blocks[startIndex];
                if (
                    startNode &&
                    startNode.hasAttribute &&
                    startNode.hasAttribute("data-background-group-start")
                ) {
                    return startIndex;
                }

                let scanIndex = startIndex;
                const currentIsHeading = !!(
                    startNode &&
                    startNode.hasAttribute &&
                    startNode.hasAttribute("data-background-heading")
                );
                if (!currentIsHeading) {
                    scanIndex = startIndex - 1;
                }

                if (scanIndex < 0) {
                    return startIndex;
                }

                let nearestHeadingIndex = -1;
                for (let index = scanIndex; index >= 0; index -= 1) {
                    const node = blocks[index];
                    const isHeading = !!(
                        node &&
                        node.hasAttribute &&
                        node.hasAttribute("data-background-heading")
                    );
                    if (!isHeading) {
                        break;
                    }
                    nearestHeadingIndex = index;
                    if (node.hasAttribute("data-background-group-start")) {
                        return index;
                    }
                }
                return nearestHeadingIndex >= 0 ? nearestHeadingIndex : startIndex;
            }

            function rollbackBackgroundHeadingsForProtectedStart(backgroundBody, blocks, protectedStartIndex, currentIndex) {
                if (!backgroundBody || !Array.isArray(blocks)) {
                    return;
                }
                let headingCountToRemove = 0;
                for (let index = protectedStartIndex; index < currentIndex; index += 1) {
                    const node = blocks[index];
                    const isHeading = !!(
                        node &&
                        node.hasAttribute &&
                        node.hasAttribute("data-background-heading")
                    );
                    if (!isHeading) {
                        break;
                    }
                    headingCountToRemove += 1;
                }
                while (headingCountToRemove > 0 && backgroundBody.lastChild) {
                    backgroundBody.removeChild(backgroundBody.lastChild);
                    headingCountToRemove -= 1;
                }
            }

            function hasMeaningfulFlowContent(container) {
                if (!container) {
                    return false;
                }
                return Array.from(container.childNodes || []).some((node) => {
                    if (node.nodeType === 3) {
                        return !!text(node.textContent);
                    }
                    if (node.nodeType !== 1) {
                        return false;
                    }
                    if (node.hasAttribute && node.hasAttribute("data-background-heading")) {
                        return true;
                    }
                    return !!text(node.textContent);
                });
            }

            function hasBackgroundBodyNonHeadingContent(backgroundBody) {
                if (!backgroundBody) {
                    return false;
                }
                return Array.from(backgroundBody.childNodes || []).some((node) => {
                    if (node.nodeType === 3) {
                        return !!text(node.textContent);
                    }
                    if (node.nodeType !== 1) {
                        return false;
                    }
                    if (node.hasAttribute && node.hasAttribute("data-background-heading")) {
                        return false;
                    }
                    return !!text(node.textContent);
                });
            }

            function isBackgroundFirstContentOfProtectedStart(blocks, protectedStartIndex, currentIndex) {
                if (!Array.isArray(blocks) || protectedStartIndex < 0 || currentIndex <= protectedStartIndex) {
                    return false;
                }
                for (let index = protectedStartIndex; index < currentIndex; index += 1) {
                    const node = blocks[index];
                    const isHeading = !!(
                        node &&
                        node.hasAttribute &&
                        node.hasAttribute("data-background-heading")
                    );
                    if (!isHeading) {
                        return false;
                    }
                }
                return true;
            }

            function appendBackgroundNodeAcrossPages(initialNode, currentPage, currentHost, backgroundSection, backgroundBody) {
                let node = initialNode;
                let page = currentPage;
                let host = currentHost;
                let section = backgroundSection;
                let body = backgroundBody;

                while (node) {
                    body.appendChild(node);
                    if (!isNodeOverFooter(page, node)) {
                        return {
                            success: true,
                            currentPage: page,
                            currentHost: host,
                            backgroundSection: section,
                            backgroundBody: body,
                        };
                    }

                    node.remove();
                    const remainder = splitCaseParagraphToFitPage(page, body, node);
                    if (!remainder) {
                        return {
                            success: false,
                            currentPage: page,
                            currentHost: host,
                            backgroundSection: section,
                            backgroundBody: body,
                        };
                    }

                    page = createFlowPage();
                    host = getFlowHost(page);
                    if (!host) {
                        return {
                            success: false,
                            currentPage: currentPage,
                            currentHost: currentHost,
                            backgroundSection: backgroundSection,
                            backgroundBody: backgroundBody,
                        };
                    }

                    section = createBackgroundSectionSkeleton(true);
                    host.appendChild(section);
                    body = section.querySelector("div:last-child");
                    node = remainder;
                }

                return {
                    success: true,
                    currentPage: page,
                    currentHost: host,
                    backgroundSection: section,
                    backgroundBody: body,
                };
            }

            function appendNarrativeNodeAcrossPages(initialNode, currentPage, currentHost, kind, title, includeHeadingOnFirstPage) {
                let node = initialNode;
                let page = currentPage;
                let host = currentHost;
                let section = createNarrativeSectionSkeleton(kind, title, !includeHeadingOnFirstPage);
                host.appendChild(section);
                let body = section.querySelector("div:last-child");

                while (node) {
                    body.appendChild(node);
                    if (!isNodeOverFooter(page, node)) {
                        return {
                            success: true,
                            currentPage: page,
                            currentHost: host,
                            section,
                            body,
                        };
                    }

                    node.remove();
                    const remainder = splitCaseParagraphToFitPage(page, body, node);
                    if (!remainder) {
                        return {
                            success: false,
                            currentPage: page,
                            currentHost: host,
                            section,
                            body,
                        };
                    }

                    page = createFlowPage();
                    host = getFlowHost(page);
                    if (!host) {
                        return {
                            success: false,
                            currentPage,
                            currentHost,
                            section,
                            body,
                        };
                    }

                    section = createNarrativeSectionSkeleton(kind, title, true);
                    host.appendChild(section);
                    body = section.querySelector("div:last-child");
                    node = remainder;
                }

                return {
                    success: true,
                    currentPage: page,
                    currentHost: host,
                    section,
                    body,
                };
            }

            function updateDynamicFooterPageNumbers() {
                if (!pageRoot) {
                    return;
                }
                const pages = Array.from(pageRoot.querySelectorAll(".page-container")).filter((page) => {
                    return !page.classList.contains("hidden") && !page.classList.contains("template-page");
                });
                const total = pages.length;
                pages.forEach((page, index) => {
                    const label = page.querySelector(".footer-section p");
                    if (label) {
                        label.textContent = "PAGE " + (index + 1) + " of " + total;
                    }
                });
            }

            function createFlowPage() {
                const page = createDynamicContentPage(pageTwoTemplate);
                if (!page) {
                    return null;
                }
                const column = page.querySelector(".flex-1.flex.flex-col");
                if (column) {
                    column.classList.remove("flex-1");
                    column.setAttribute("data-flow-host", "1");
                    column.innerHTML = "";
                }
                return page;
            }

            function getFlowHost(page) {
                if (!page) {
                    return null;
                }
                if (page === pageOne) {
                    return page.querySelector(".content-wrapper");
                }
                return page.querySelector("[data-flow-host=\"1\"]") || page.querySelector(".flex.flex-col");
            }

            function createPlanSection(isContinuation) {
                const section = document.createElement("section");
                section.className = isContinuation ? "mb-2" : "mb-4";
                section.setAttribute("data-flow-kind", "plan");
                section.innerHTML =
                    (isContinuation
                        ? ""
                        : "<h2 class=\"doc-text font-bold mb-2\">VI. INTERVENTION PLAN/PLAN IMPLEMENTATION</h2>") +
                    "<table class=\"report-table doc-text w-full\">" +
                    "<colgroup><col style=\"width: 16%;\" /><col style=\"width: 22%;\" /><col style=\"width: 12%;\" /><col style=\"width: 16%;\" /><col style=\"width: 16%;\" /><col style=\"width: 18%;\" /></colgroup>" +
                    (isContinuation
                        ? ""
                        : "<thead><tr><th>Specific Objective</th><th>Activities</th><th>Timeframe</th><th>Person Responsible</th><th>Materials Needed</th><th>Expected Output</th></tr></thead>") +
                    "<tbody></tbody></table>";
                return section;
            }

            function createRecommendationSignatures() {
                const block = document.createElement("div");
                block.innerHTML =
                    "<section class=\"mt-8 w-full\">" +
                    "<div class=\"flex flex-col gap-y-12\">" +
                    "<div class=\"flex flex-col\"><span class=\"text-[12pt] font-normal text-black mb-6 font-calibri\">Prepared by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-1\"><span data-csr-field=\"preparedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri leading-tight\">PDO II-Municipal Link</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "<div class=\"flex flex-col\"><span class=\"text-[12pt] font-normal text-black mb-6 font-calibri\">Reviewed by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-1\"><span data-csr-field=\"reviewedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri leading-tight\">Social Welfare Officer III</p><div class=\"flex items-end gap-2 mt-1 font-calibri text-[12pt]\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div></div>" +
                    "<div class=\"flex flex-col\"><span class=\"text-[12pt] font-normal text-black mb-6 font-calibri\">Noted by:</span><div><p class=\"font-bold text-[12pt] text-black uppercase font-calibri mb-1\"><span data-csr-field=\"approvedBy\"></span></p><p class=\"text-[12pt] text-black font-normal font-calibri leading-tight\">Provincial Link</p></div></div>" +
                    "</div></section>";
                return block;
            }

            function createRecommendationCombinedSection(payload) {
                const wrapper = document.createElement("section");
                wrapper.className = "mb-2 recommendation-combined-section";
                wrapper.setAttribute("data-flow-kind", "recommendation");
                const recommendationBlocks = getNarrativeBlocksFromPlainText(
                    payload && payload.recommendation && payload.recommendation.recommendationText
                );
                const recBody = document.createElement("div");
                recBody.innerHTML =
                    "<section>" +
                    "<div class=\"flex gap-4 mb-2 calibri-font\"><h3 class=\"font-bold text-[12pt]\">VIII. CASE RECOMMENDATION</h3></div>" +
                    "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>" +
                    "</section>";
                const recBodyContainer = recBody.querySelector("[data-flow-body=\"1\"]");
                if (recBodyContainer) {
                    recommendationBlocks.forEach((node) => {
                        recBodyContainer.appendChild(node.cloneNode(true));
                    });
                }
                const recSign = createRecommendationSignatures();
                wrapper.appendChild(recBody);
                wrapper.appendChild(recSign);
                return wrapper;
            }

            function getVisiblePages() {
                if (!pageRoot) {
                    return [];
                }
                return Array.from(pageRoot.querySelectorAll(".page-container")).filter((page) => {
                    return !page.classList.contains("hidden") && !page.classList.contains("template-page");
                });
            }

            function getFlowSectionOrder() {
                return [
                    "family",
                    "case",
                    "background",
                    "assessment",
                    "plan",
                    "evaluation",
                    "recommendation",
                ];
            }

            function getFlowKindOrderIndex(kind) {
                return getFlowSectionOrder().indexOf(kind);
            }

            function pageHasFlowKindEarlierThan(page, kind) {
                const currentIndex = getFlowKindOrderIndex(kind);
                if (!page || currentIndex < 0) {
                    return false;
                }
                return getFlowSectionOrder().some((candidateKind) => {
                    const candidateIndex = getFlowKindOrderIndex(candidateKind);
                    return candidateIndex >= 0 &&
                        candidateIndex < currentIndex &&
                        !!getFirstSectionByKind(page, candidateKind);
                });
            }

            function pageHasFlowKindLaterThan(page, kind) {
                const currentIndex = getFlowKindOrderIndex(kind);
                if (!page || currentIndex < 0) {
                    return false;
                }
                return getFlowSectionOrder().some((candidateKind) => {
                    const candidateIndex = getFlowKindOrderIndex(candidateKind);
                    return candidateIndex > currentIndex && !!getFirstSectionByKind(page, candidateKind);
                });
            }

            function shouldSkipRebalanceForDocumentOrder(prevPage, nextPage, kind, prevSection) {
                if (!prevPage || !nextPage) {
                    return false;
                }
                if (pageHasFlowKindLaterThan(prevPage, kind)) {
                    return true;
                }
                if (!prevSection && pageHasFlowKindEarlierThan(nextPage, kind)) {
                    return true;
                }
                return false;
            }

            function getFirstSectionByKind(page, kind) {
                if (!page) {
                    return null;
                }
                return page.querySelector("[data-flow-kind=\"" + kind + "\"]");
            }

            function getLastSectionByKind(page, kind) {
                if (!page) {
                    return null;
                }
                const sections = page.querySelectorAll("[data-flow-kind=\"" + kind + "\"]");
                return sections.length ? sections[sections.length - 1] : null;
            }

            function getSectionFlowContainer(section) {
                if (!section) {
                    return null;
                }
                const tbody = section.querySelector("tbody");
                if (tbody) {
                    return tbody;
                }
                return section.querySelector("[data-flow-body=\"1\"]");
            }

            function createContinuationSectionByKind(kind) {
                if (kind === "family") {
                    return createFamilySection([], true, true);
                }
                if (kind === "case") {
                    const section = document.createElement("section");
                    section.className = "mb-2";
                    section.setAttribute("data-flow-kind", "case");
                    section.innerHTML =
                        "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                    return section;
                }
                if (kind === "background") {
                    const section = document.createElement("section");
                    section.className = "mb-2";
                    section.setAttribute("data-flow-kind", "background");
                    section.innerHTML =
                        "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                    return section;
                }
                if (kind === "assessment") {
                    return createNarrativeSectionSkeleton("assessment", "V. CASE ASSESSMENT", true);
                }
                if (kind === "plan") {
                    return createPlanSection(true);
                }
                if (kind === "evaluation") {
                    return createNarrativeSectionSkeleton("evaluation", "VII. CASE MANAGEMENT EVALUATION", true);
                }
                return null;
            }

            function createRebalanceSectionShellFromNext(nextSection, kind) {
                if (!nextSection) {
                    return createContinuationSectionByKind(kind);
                }
                const cloned = nextSection.cloneNode(true);
                const flowContainer = getSectionFlowContainer(cloned);
                if (flowContainer) {
                    flowContainer.innerHTML = "";
                }
                return cloned;
            }

            function normalizeContinuationSectionByKind(section, kind) {
                if (!section) {
                    return;
                }
                if (kind === "family") {
                    const heading = section.querySelector("h2");
                    if (heading) {
                        heading.remove();
                    }
                    const thead = section.querySelector("thead");
                    if (thead) {
                        thead.remove();
                    }
                    return;
                }
                if (kind === "background") {
                    const headingWrapper = section.querySelector(".flex.gap-4.mb-2");
                    if (headingWrapper) {
                        headingWrapper.remove();
                    }
                    return;
                }
                if (kind === "plan") {
                    const heading = section.querySelector("h2");
                    if (heading) {
                        heading.remove();
                    }
                    const thead = section.querySelector("thead");
                    if (thead) {
                        thead.remove();
                    }
                    section.classList.remove("mb-4");
                    section.classList.add("mb-2");
                    return;
                }
                if (
                    kind === "case" ||
                    kind === "assessment" ||
                    kind === "evaluation"
                ) {
                    const headingWrapper = section.querySelector(".flex.gap-4.mb-2");
                    if (headingWrapper) {
                        headingWrapper.remove();
                    }
                }
            }

            function rebalanceNodesBetweenSections(prevPage, prevSection, nextSection) {
                const prevContainer = getSectionFlowContainer(prevSection);
                const nextContainer = getSectionFlowContainer(nextSection);
                if (!prevContainer || !nextContainer) {
                    return false;
                }
                let movedAny = false;
                while (nextContainer.firstElementChild) {
                    const moved = nextContainer.firstElementChild;
                    prevContainer.appendChild(moved);
                    const overFooter = prevContainer.tagName === "TBODY"
                        ? isLastRowOverFooter(prevPage, prevContainer)
                        : isNodeOverFooter(prevPage, moved);
                    if (overFooter) {
                        nextContainer.insertBefore(moved, nextContainer.firstElementChild);
                        break;
                    }
                    movedAny = true;
                }
                if (!nextContainer.childElementCount && nextSection.parentElement) {
                    nextSection.remove();
                    movedAny = true;
                }
                return movedAny;
            }

            function createPlanRebalanceShell(nextSection, isContinuation) {
                if (nextSection && !isContinuation) {
                    const cloned = nextSection.cloneNode(true);
                    const tbody = cloned.querySelector("tbody");
                    if (tbody) {
                        tbody.innerHTML = "";
                    }
                    return cloned;
                }
                return createPlanSection(!!isContinuation);
            }

            function rebalancePlanNodesBetweenSections(prevPage, prevSection, nextSection, createdPrevShell) {
                const prevContainer = getSectionFlowContainer(prevSection);
                const nextContainer = getSectionFlowContainer(nextSection);
                if (!prevContainer || !nextContainer) {
                    return false;
                }

                let movedAny = false;
                const needsProtectedStart =
                    !!createdPrevShell &&
                    !prevContainer.children.length;

                if (needsProtectedStart) {
                    const firstRow = nextContainer.firstElementChild;
                    if (!firstRow) {
                        return false;
                    }
                    prevContainer.appendChild(firstRow);
                    const overFooter = isLastRowOverFooter(prevPage, prevContainer) || isPageOverflowing(prevPage);
                    if (overFooter) {
                        firstRow.remove();
                        nextContainer.insertBefore(firstRow, nextContainer.firstElementChild);
                        return false;
                    }
                    movedAny = true;
                }

                while (nextContainer.firstElementChild) {
                    const moved = nextContainer.firstElementChild;
                    prevContainer.appendChild(moved);
                    const overFooter = isLastRowOverFooter(prevPage, prevContainer) || isPageOverflowing(prevPage);
                    if (overFooter) {
                        moved.remove();
                        nextContainer.insertBefore(moved, nextContainer.firstElementChild);
                        break;
                    }
                    movedAny = true;
                }

                if (!nextContainer.childElementCount && nextSection.parentElement) {
                    nextSection.remove();
                    movedAny = true;
                }
                return movedAny;
            }

            function rebalanceCaseNodesBetweenSections(prevPage, prevSection, nextSection) {
                const prevContainer = getSectionFlowContainer(prevSection);
                const nextContainer = getSectionFlowContainer(nextSection);
                if (!prevContainer || !nextContainer) {
                    return false;
                }

                let movedAny = false;
                while (nextContainer.firstElementChild) {
                    const first = nextContainer.firstElementChild;
                    prevContainer.appendChild(first);
                    const overFooter = isNodeOverFooter(
                        prevPage,
                        first,
                        NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX
                    );
                    if (overFooter) {
                        first.remove();
                        const firstTag = String(first && first.tagName || "").toUpperCase();
                        if (firstTag === "P") {
                            const remainder = splitCaseParagraphToFitPage(
                                prevPage,
                                prevContainer,
                                first
                            );
                            if (remainder) {
                                nextContainer.insertBefore(remainder, nextContainer.firstElementChild);
                                movedAny = true;
                                continue;
                            }
                        }
                        nextContainer.insertBefore(first, nextContainer.firstElementChild);
                        break;
                    }
                    movedAny = true;
                }

                if (!nextContainer.childElementCount && nextSection.parentElement) {
                    nextSection.remove();
                    movedAny = true;
                }
                return movedAny;
            }

            function isSplitAwareNarrativeKind(kind) {
                return (
                    kind === "case" ||
                    kind === "assessment" ||
                    kind === "evaluation"
                );
            }

            function rebalanceBackgroundNodesBetweenSections(prevPage, prevSection, nextSection) {
                const prevContainer = getSectionFlowContainer(prevSection);
                const nextContainer = getSectionFlowContainer(nextSection);
                if (!prevContainer || !nextContainer) {
                    return false;
                }

                let movedAny = false;
                while (nextContainer.firstElementChild) {
                    const first = nextContainer.firstElementChild;
                    const isHeading =
                        !!(first && first.hasAttribute && first.hasAttribute("data-background-heading"));

                    if (isHeading) {
                        // Move heading blocks only with at least one body node to avoid orphan headings.
                        const headingBatch = [];
                        let cursor = nextContainer.firstElementChild;
                        while (
                            cursor &&
                            cursor.nodeType === 1 &&
                            cursor.hasAttribute &&
                            cursor.hasAttribute("data-background-heading")
                        ) {
                            headingBatch.push(cursor);
                            cursor = cursor.nextElementSibling;
                        }
                        const firstContent = cursor;
                        if (!firstContent) {
                            break;
                        }

                        const batch = [...headingBatch, firstContent];
                        batch.forEach((node) => prevContainer.appendChild(node));
                        const overFooter = isNodeOverFooter(
                            prevPage,
                            batch[batch.length - 1],
                            NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX
                        );
                        if (overFooter) {
                            // If only part of the first paragraph can fit, keep heading + opening lines
                            // on previous page and continue the remaining paragraph on next page.
                            const firstTag = String(firstContent && firstContent.tagName || "").toUpperCase();
                            if (firstTag === "P") {
                                firstContent.remove();
                                const remainder = splitCaseParagraphToFitPage(
                                    prevPage,
                                    prevContainer,
                                    firstContent
                                );
                                if (remainder) {
                                    nextContainer.insertBefore(remainder, nextContainer.firstElementChild);
                                    movedAny = true;
                                    continue;
                                }
                            }
                            for (let index = batch.length - 1; index >= 0; index -= 1) {
                                const node = batch[index];
                                nextContainer.insertBefore(node, nextContainer.firstElementChild);
                            }
                            break;
                        }
                        movedAny = true;
                        continue;
                    }

                    prevContainer.appendChild(first);
                    const overFooter = isNodeOverFooter(
                        prevPage,
                        first,
                        NARRATIVE_CONTINUATION_SPLIT_BUFFER_PX
                    );
                    if (overFooter) {
                        first.remove();
                        const firstTag = String(first && first.tagName || "").toUpperCase();
                        if (firstTag === "P") {
                            const remainder = splitCaseParagraphToFitPage(
                                prevPage,
                                prevContainer,
                                first
                            );
                            if (remainder) {
                                nextContainer.insertBefore(remainder, nextContainer.firstElementChild);
                                movedAny = true;
                                continue;
                            }
                        }
                        nextContainer.insertBefore(first, nextContainer.firstElementChild);
                        break;
                    }
                    movedAny = true;
                }

                if (!nextContainer.childElementCount && nextSection.parentElement) {
                    nextSection.remove();
                    movedAny = true;
                }
                return movedAny;
            }

            function rebalanceFlowKind(kind) {
                let changed = false;
                const pages = getVisiblePages();
                for (let i = 0; i < pages.length - 1; i += 1) {
                    const prevPage = pages[i];
                    const nextPage = pages[i + 1];
                    let prevSection = getLastSectionByKind(prevPage, kind);
                    const nextSection = getFirstSectionByKind(nextPage, kind);
                    let createdPrevShell = false;
                    if (!nextSection) {
                        continue;
                    }
                    // Keep section III from jumping backward to a page where it never started.
                    // We only rebalance case content upward when the previous page already
                    // contains a case section and the next page is a continuation.
                    if (kind === "case" && !prevSection) {
                        continue;
                    }
                    if (shouldSkipRebalanceForDocumentOrder(prevPage, nextPage, kind, prevSection)) {
                        continue;
                    }
                    if (!prevSection) {
                        const prevHost = getFlowHost(prevPage);
                        const continuation = kind === "plan"
                            ? createPlanRebalanceShell(nextSection, false)
                            : createRebalanceSectionShellFromNext(nextSection, kind);
                        if (!prevHost || !continuation) {
                            continue;
                        }
                        prevHost.appendChild(continuation);
                        if (isNodeOverFooter(prevPage, continuation)) {
                            continuation.remove();
                            continue;
                        }
                        prevSection = continuation;
                        createdPrevShell = true;
                    }
                    const movedIntoPrevious = kind === "background"
                        ? rebalanceBackgroundNodesBetweenSections(prevPage, prevSection, nextSection)
                        : kind === "plan"
                        ? rebalancePlanNodesBetweenSections(prevPage, prevSection, nextSection, createdPrevShell)
                        : isSplitAwareNarrativeKind(kind)
                        ? rebalanceCaseNodesBetweenSections(prevPage, prevSection, nextSection)
                        : rebalanceNodesBetweenSections(prevPage, prevSection, nextSection);
                    const prevContainer = getSectionFlowContainer(prevSection);
                    const hasMovedContent =
                        prevContainer &&
                        (
                            prevContainer.tagName === "TBODY"
                                ? prevContainer.children.length > 0
                                : prevContainer.childNodes.length > 0
                        );
                    if (!movedIntoPrevious && prevSection && prevSection.parentElement && !hasMovedContent) {
                        prevSection.remove();
                        continue;
                    }
                    if (
                        movedIntoPrevious &&
                        nextSection &&
                        nextSection.parentElement &&
                        (createdPrevShell || isSplitAwareNarrativeKind(kind))
                    ) {
                        normalizeContinuationSectionByKind(nextSection, kind);
                    }
                    if (movedIntoPrevious) {
                        changed = true;
                    }
                }
                return changed;
            }

            function pruneEmptyGeneratedPages() {
                if (!pageRoot) {
                    return;
                }
                Array.from(pageRoot.querySelectorAll(".generated-dynamic-page")).forEach((page) => {
                    const host = getFlowHost(page);
                    if (!host) {
                        return;
                    }
                    const hasContent = Array.from(host.children).some((node) => {
                        return node.nodeType === 1;
                    });
                    if (!hasContent) {
                        page.remove();
                    }
                });
            }

            function runFlowRebalancePass() {
                // Background uses a guarded rebalance strategy to reduce large white gaps.
                // Case is rebalanced only when section III already exists on the previous page,
                // which avoids pulling the start of Presenting Problem backward unexpectedly.
                const kinds = ["family", "case", "background", "assessment", "plan", "evaluation"];
                for (let pass = 0; pass < 4; pass += 1) {
                    let changed = false;
                    kinds.forEach((kind) => {
                        if (rebalanceFlowKind(kind)) {
                            changed = true;
                        }
                    });
                    pruneEmptyGeneratedPages();
                    if (!changed) {
                        break;
                    }
                }
            }

            function paginateAllSections(payload) {
                if (!pageOne) {
                    return;
                }
                clearPageOneDynamicFlowSections();
                removeGeneratedDynamicPages();
                syncAllPageContentHeights();

                let currentPage = pageOne;
                let currentHost = getFlowHost(currentPage);

                const familyRows = Array.isArray(payload && payload.familyComposition)
                    ? payload.familyComposition.slice()
                    : [];
                let familyIndex = 0;
                const pageOneBody = document.getElementById("csr-family-composition-body");
                if (pageOneBody) {
                    pageOneBody.innerHTML = "";
                    while (familyIndex < familyRows.length) {
                        pageOneBody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(familyRows[familyIndex]));
                        if (isPageOverflowing(pageOne) || isLastRowOverFooter(pageOne, pageOneBody)) {
                            if (pageOneBody.lastElementChild) {
                                pageOneBody.lastElementChild.remove();
                            }
                            break;
                        }
                        familyIndex += 1;
                    }
                }

                while (familyIndex < familyRows.length) {
                    if (currentPage === pageOne || !currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentPage || !currentHost) {
                            break;
                        }
                    }
                    const familySection = createFamilySection([], true, true);
                    currentHost.appendChild(familySection);
                    if (isNodeOverFooter(currentPage, familySection)) {
                        familySection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentPage || !currentHost) {
                            break;
                        }
                        currentHost.appendChild(familySection);
                    }
                    const tbody = familySection.querySelector("tbody");
                    while (familyIndex < familyRows.length) {
                        tbody.insertAdjacentHTML("beforeend", buildFamilyRowHtml(familyRows[familyIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            break;
                        }
                        familyIndex += 1;
                    }
                    if (familyIndex < familyRows.length) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                }

                const caseBlocks = getCaseDevelopmentBlocks(payload);
                if (caseBlocks.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    let caseSection = document.createElement("section");
                    caseSection.className = "mb-2";
                    caseSection.setAttribute("data-flow-kind", "case");
                    caseSection.innerHTML =
                        "<div class=\"flex gap-4 mb-2 calibri-font\"><h3 class=\"font-bold text-[12pt]\">III. PRESENTING PROBLEM</h3></div>" +
                        "<div class=\"calibri-font text-[12pt] leading-[1.2] text-justify case-development-body\" data-flow-body=\"1\"></div>";
                    currentHost.appendChild(caseSection);
                    if (isNodeOverFooter(currentPage, caseSection)) {
                        caseSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            currentHost.appendChild(caseSection);
                        }
                    }
                    let caseBody = caseSection.querySelector("div:last-child");
                    let caseIndex = 0;
                    while (caseIndex < caseBlocks.length) {
                        const node = caseBlocks[caseIndex].cloneNode(true);
                        if (
                            !caseBody.childNodes.length &&
                            shouldMoveNarrativeStartBlockToNextPage(
                                currentPage,
                                caseBody,
                                node,
                                1
                            )
                        ) {
                            if (caseSection.parentElement) {
                                caseSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            caseSection = createNarrativeSectionSkeleton("case", "III. PRESENTING PROBLEM", false);
                            currentHost.appendChild(caseSection);
                            caseBody = caseSection.querySelector("div:last-child");
                        }
                        caseBody.appendChild(node);
                        if (isNodeOverFooter(currentPage, node)) {
                            node.remove();
                            const remainder = splitCaseParagraphToFitPage(currentPage, caseBody, node);
                            const shouldRestartSection =
                                !caseBody.childNodes.length && caseSection.parentElement;
                            if (shouldRestartSection) {
                                caseSection.remove();
                            }
                            if (remainder) {
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                const narrativeAppendResult = appendNarrativeNodeAcrossPages(
                                    remainder,
                                    currentPage,
                                    currentHost,
                                    "case",
                                    "III. PRESENTING PROBLEM",
                                    shouldRestartSection
                                );
                                if (!narrativeAppendResult.success) {
                                    break;
                                }
                                currentPage = narrativeAppendResult.currentPage;
                                currentHost = narrativeAppendResult.currentHost;
                                caseSection = narrativeAppendResult.section;
                                caseBody = narrativeAppendResult.body;
                                caseIndex += 1;
                                continue;
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            const narrativeAppendResult = appendNarrativeNodeAcrossPages(
                                node,
                                currentPage,
                                currentHost,
                                "case",
                                "III. PRESENTING PROBLEM",
                                shouldRestartSection
                            );
                            if (!narrativeAppendResult.success) {
                                break;
                            }
                            currentPage = narrativeAppendResult.currentPage;
                            currentHost = narrativeAppendResult.currentHost;
                            caseSection = narrativeAppendResult.section;
                            caseBody = narrativeAppendResult.body;
                            caseIndex += 1;
                            continue;
                        }
                        caseIndex += 1;
                    }
                }

                const backgroundBlocks = buildBackgroundBlocks(payload);
                if (backgroundBlocks.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    let backgroundSection = createBackgroundSectionSkeleton(false);
                    currentHost.appendChild(backgroundSection);
                    if (isNodeOverFooter(currentPage, backgroundSection)) {
                        backgroundSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            backgroundSection = createBackgroundSectionSkeleton(false);
                            currentHost.appendChild(backgroundSection);
                        }
                    }
                    let backgroundBody = backgroundSection.querySelector("div:last-child");
                    let backgroundIndex = 0;
                    while (backgroundIndex < backgroundBlocks.length) {
                        const protectedStartIndex = getBackgroundProtectedStartIndex(
                            backgroundBlocks,
                            backgroundIndex
                        );
                        if (
                            backgroundBody &&
                            shouldMoveBackgroundStartBlockToNextPage(
                                currentPage,
                                backgroundBody,
                                backgroundBlocks,
                                backgroundIndex
                            )
                        ) {
                            if (protectedStartIndex < backgroundIndex) {
                                while (
                                    backgroundBody &&
                                    backgroundBody.lastChild &&
                                    backgroundBody.lastChild.nodeType === 1 &&
                                    backgroundBody.lastChild.hasAttribute &&
                                    backgroundBody.lastChild.hasAttribute("data-background-heading")
                                ) {
                                    backgroundBody.removeChild(backgroundBody.lastChild);
                                }
                                backgroundIndex = protectedStartIndex;
                            }
                            if (
                                backgroundSection &&
                                backgroundBody &&
                                !hasMeaningfulFlowContent(backgroundBody)
                            ) {
                                backgroundSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            backgroundSection = createBackgroundSectionSkeleton(backgroundIndex > 0);
                            currentHost.appendChild(backgroundSection);
                            backgroundBody = backgroundSection.querySelector("div:last-child");
                            continue;
                        }
                        const node = backgroundBlocks[backgroundIndex].cloneNode(true);
                        backgroundBody.appendChild(node);
                        if (isNodeOverFooter(currentPage, node)) {
                            node.remove();
                            const protectedStartIndex = getBackgroundProtectedStartIndex(
                                backgroundBlocks,
                                backgroundIndex
                            );
                            const isProtectedStartFirstContent =
                                isBackgroundFirstContentOfProtectedStart(
                                    backgroundBlocks,
                                    protectedStartIndex,
                                    backgroundIndex
                                );
                            if (!backgroundBody.childNodes.length) {
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                backgroundSection = createBackgroundSectionSkeleton(true);
                                currentHost.appendChild(backgroundSection);
                                backgroundBody = backgroundSection.querySelector("div:last-child");
                                const backgroundAppendResult = appendBackgroundNodeAcrossPages(
                                    node,
                                    currentPage,
                                    currentHost,
                                    backgroundSection,
                                    backgroundBody
                                );
                                if (!backgroundAppendResult.success) {
                                    break;
                                }
                                currentPage = backgroundAppendResult.currentPage;
                                currentHost = backgroundAppendResult.currentHost;
                                backgroundSection = backgroundAppendResult.backgroundSection;
                                backgroundBody = backgroundAppendResult.backgroundBody;
                                backgroundIndex += 1;
                                continue;
                            }
                            const shouldRollbackBackgroundStart =
                                shouldRollbackBackgroundProtectedStartOnOverflow(
                                    currentPage,
                                    backgroundBody,
                                    backgroundBlocks,
                                    protectedStartIndex,
                                    backgroundIndex,
                                    node
                                );
                            if (isProtectedStartFirstContent && !shouldRollbackBackgroundStart) {
                                // Keep section heading with opening lines when they can fit on current page.
                                const backgroundAppendResult = appendBackgroundNodeAcrossPages(
                                    node,
                                    currentPage,
                                    currentHost,
                                    backgroundSection,
                                    backgroundBody
                                );
                                if (!backgroundAppendResult.success) {
                                    break;
                                }
                                currentPage = backgroundAppendResult.currentPage;
                                currentHost = backgroundAppendResult.currentHost;
                                backgroundSection = backgroundAppendResult.backgroundSection;
                                backgroundBody = backgroundAppendResult.backgroundBody;
                                backgroundIndex += 1;
                                continue;
                            }
                            if (shouldRollbackBackgroundStart) {
                                rollbackBackgroundHeadingsForProtectedStart(
                                    backgroundBody,
                                    backgroundBlocks,
                                    protectedStartIndex,
                                    backgroundIndex
                                );
                                backgroundIndex = protectedStartIndex;
                                const shouldRestartBackgroundSection =
                                    backgroundSection &&
                                    backgroundBody &&
                                    !hasBackgroundBodyNonHeadingContent(backgroundBody);
                                if (shouldRestartBackgroundSection) {
                                    backgroundSection.remove();
                                }
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                backgroundSection = createBackgroundSectionSkeleton(
                                    !shouldRestartBackgroundSection
                                );
                                currentHost.appendChild(backgroundSection);
                                backgroundBody = backgroundSection.querySelector("div:last-child");
                                continue;
                            }
                            // For non-protected overflow paragraphs, split on the current page first
                            // to consume remaining space before moving continuation to the next page.
                            const continuationNode = splitCaseParagraphToFitPage(
                                currentPage,
                                backgroundBody,
                                node
                            );
                            if (continuationNode) {
                                currentPage = createFlowPage();
                                currentHost = getFlowHost(currentPage);
                                if (!currentHost) {
                                    break;
                                }
                                backgroundSection = createBackgroundSectionSkeleton(true);
                                currentHost.appendChild(backgroundSection);
                                backgroundBody = backgroundSection.querySelector("div:last-child");
                                const backgroundAppendResult = appendBackgroundNodeAcrossPages(
                                    continuationNode,
                                    currentPage,
                                    currentHost,
                                    backgroundSection,
                                    backgroundBody
                                );
                                if (!backgroundAppendResult.success) {
                                    break;
                                }
                                currentPage = backgroundAppendResult.currentPage;
                                currentHost = backgroundAppendResult.currentHost;
                                backgroundSection = backgroundAppendResult.backgroundSection;
                                backgroundBody = backgroundAppendResult.backgroundBody;
                                backgroundIndex += 1;
                                continue;
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            backgroundSection = createBackgroundSectionSkeleton(true);
                            currentHost.appendChild(backgroundSection);
                            backgroundBody = backgroundSection.querySelector("div:last-child");
                            backgroundBody.appendChild(node);
                            let backgroundAppendResult = {
                                success: true,
                                currentPage,
                                currentHost,
                                backgroundSection,
                                backgroundBody,
                            };
                            if (isNodeOverFooter(currentPage, node)) {
                                // Prefer moving whole paragraph to next page; split only when a single
                                // paragraph still cannot fit on a fresh page.
                                node.remove();
                                backgroundAppendResult = appendBackgroundNodeAcrossPages(
                                    node,
                                    currentPage,
                                    currentHost,
                                    backgroundSection,
                                    backgroundBody
                                );
                            }
                            if (!backgroundAppendResult.success) {
                                break;
                            }
                            currentPage = backgroundAppendResult.currentPage;
                            currentHost = backgroundAppendResult.currentHost;
                            backgroundSection = backgroundAppendResult.backgroundSection;
                            backgroundBody = backgroundAppendResult.backgroundBody;
                        }
                        backgroundIndex += 1;
                    }
                }

                const assessmentBlocks = getNarrativeBlocksFromHtml(
                    payload && payload.caseAssessment && payload.caseAssessment.html
                );
                if (assessmentBlocks.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    let assessmentSection = createNarrativeSectionSkeleton("assessment", "V. CASE ASSESSMENT", false);
                    currentHost.appendChild(assessmentSection);
                    if (isNodeOverFooter(currentPage, assessmentSection)) {
                        assessmentSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            assessmentSection = createNarrativeSectionSkeleton("assessment", "V. CASE ASSESSMENT", false);
                            currentHost.appendChild(assessmentSection);
                        }
                    }
                    let assessmentBody = assessmentSection.querySelector("div:last-child");
                    let assessmentIndex = 0;
                    while (assessmentIndex < assessmentBlocks.length) {
                        const node = assessmentBlocks[assessmentIndex].cloneNode(true);
                        if (
                            !assessmentBody.childNodes.length &&
                            shouldMoveNarrativeStartBlockToNextPage(
                                currentPage,
                                assessmentBody,
                                node,
                                1
                            )
                        ) {
                            if (assessmentSection.parentElement) {
                                assessmentSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            assessmentSection = createNarrativeSectionSkeleton("assessment", "V. CASE ASSESSMENT", false);
                            currentHost.appendChild(assessmentSection);
                            assessmentBody = assessmentSection.querySelector("div:last-child");
                        }
                        assessmentBody.appendChild(node);
                        if (isNodeOverFooter(currentPage, node)) {
                            node.remove();
                            const remainder = splitCaseParagraphToFitPage(currentPage, assessmentBody, node);
                            const shouldRestartSection =
                                !assessmentBody.childNodes.length && assessmentSection.parentElement;
                            if (shouldRestartSection) {
                                assessmentSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            const narrativeAppendResult = appendNarrativeNodeAcrossPages(
                                remainder || node,
                                currentPage,
                                currentHost,
                                "assessment",
                                "V. CASE ASSESSMENT",
                                shouldRestartSection
                            );
                            if (!narrativeAppendResult.success) {
                                break;
                            }
                            currentPage = narrativeAppendResult.currentPage;
                            currentHost = narrativeAppendResult.currentHost;
                            assessmentSection = narrativeAppendResult.section;
                            assessmentBody = narrativeAppendResult.body;
                        }
                        assessmentIndex += 1;
                    }
                }

                const plans = Array.isArray(payload && payload.interventionPlanImplementation)
                    ? payload.interventionPlanImplementation.slice()
                    : [];
                let planIndex = 0;
                let planHeadingDone = false;
                while (planIndex < plans.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    const section = createPlanSection(planHeadingDone);
                    currentHost.appendChild(section);
                    if (isNodeOverFooter(currentPage, section)) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (!currentHost) {
                            break;
                        }
                        currentHost.appendChild(section);
                    }
                    const tbody = section.querySelector("tbody");
                    let planRowsAdded = 0;

                    // Keep section start together: heading + first row must fit on the same page.
                    if (planIndex < plans.length) {
                        tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            section.remove();
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            currentHost.appendChild(section);
                            tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                            if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                                if (tbody.lastElementChild) {
                                    tbody.lastElementChild.remove();
                                }
                                break;
                            }
                        }
                        planRowsAdded += 1;
                        planIndex += 1;
                    }

                    while (planIndex < plans.length) {
                        tbody.insertAdjacentHTML("beforeend", buildPlanRowHtml(plans[planIndex]));
                        if (isPageOverflowing(currentPage) || isLastRowOverFooter(currentPage, tbody)) {
                            if (tbody.lastElementChild) {
                                tbody.lastElementChild.remove();
                            }
                            break;
                        }
                        planRowsAdded += 1;
                        planIndex += 1;
                    }
                    if (planRowsAdded === 0 && planIndex < plans.length) {
                        section.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        continue;
                    }
                    if (planRowsAdded > 0) {
                        planHeadingDone = true;
                    }
                    if (planIndex < plans.length) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                }

                const evaluationBlocks = getNarrativeBlocksFromHtml(
                    payload && payload.caseManagementEvaluation && payload.caseManagementEvaluation.html
                );
                if (evaluationBlocks.length) {
                    if (!currentHost) {
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                    }
                    let evaluationSection = createNarrativeSectionSkeleton("evaluation", "VII. CASE MANAGEMENT EVALUATION", false);
                    currentHost.appendChild(evaluationSection);
                    if (isNodeOverFooter(currentPage, evaluationSection)) {
                        evaluationSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            evaluationSection = createNarrativeSectionSkeleton("evaluation", "VII. CASE MANAGEMENT EVALUATION", false);
                            currentHost.appendChild(evaluationSection);
                        }
                    }
                    let evaluationBody = evaluationSection.querySelector("div:last-child");
                    let evaluationIndex = 0;
                    while (evaluationIndex < evaluationBlocks.length) {
                        const node = evaluationBlocks[evaluationIndex].cloneNode(true);
                        if (
                            !evaluationBody.childNodes.length &&
                            shouldMoveNarrativeStartBlockToNextPage(
                                currentPage,
                                evaluationBody,
                                node,
                                1
                            )
                        ) {
                            if (evaluationSection.parentElement) {
                                evaluationSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            evaluationSection = createNarrativeSectionSkeleton("evaluation", "VII. CASE MANAGEMENT EVALUATION", false);
                            currentHost.appendChild(evaluationSection);
                            evaluationBody = evaluationSection.querySelector("div:last-child");
                        }
                        evaluationBody.appendChild(node);
                        if (isNodeOverFooter(currentPage, node)) {
                            node.remove();
                            const remainder = splitCaseParagraphToFitPage(currentPage, evaluationBody, node);
                            const shouldRestartSection =
                                !evaluationBody.childNodes.length && evaluationSection.parentElement;
                            if (shouldRestartSection) {
                                evaluationSection.remove();
                            }
                            currentPage = createFlowPage();
                            currentHost = getFlowHost(currentPage);
                            if (!currentHost) {
                                break;
                            }
                            const narrativeAppendResult = appendNarrativeNodeAcrossPages(
                                remainder || node,
                                currentPage,
                                currentHost,
                                "evaluation",
                                "VII. CASE MANAGEMENT EVALUATION",
                                shouldRestartSection
                            );
                            if (!narrativeAppendResult.success) {
                                break;
                            }
                            currentPage = narrativeAppendResult.currentPage;
                            currentHost = narrativeAppendResult.currentHost;
                            evaluationSection = narrativeAppendResult.section;
                            evaluationBody = narrativeAppendResult.body;
                        }
                        evaluationIndex += 1;
                    }
                }

                runFlowRebalancePass();
                const visiblePages = getVisiblePages();
                currentPage = visiblePages.length ? visiblePages[visiblePages.length - 1] : currentPage;
                currentHost = getFlowHost(currentPage);

                const recSection = createRecommendationCombinedSection(payload);
                if (!currentHost) {
                    currentPage = createFlowPage();
                    currentHost = getFlowHost(currentPage);
                }
                if (currentHost) {
                    currentHost.appendChild(recSection);
                    if (isNodeOverFooter(currentPage, recSection)) {
                        recSection.remove();
                        currentPage = createFlowPage();
                        currentHost = getFlowHost(currentPage);
                        if (currentHost) {
                            currentHost.appendChild(recSection);
                        }
                    }
                }
            }

            function buildInterventionRowHtml(row) {
                return "<tr>" +
                    "<td>" + escapeHtml(text(row && row.intervention, "N/A")) + "</td>" +
                    "<td class=\"col-center\">" + escapeHtml(text(row && row.dateCompleted, "N/A")) + "</td>" +
                    "<td class=\"col-center\">" + escapeHtml(text(row && row.involvedParties, "N/A")) + "</td>" +
                    "</tr>";
            }

            function buildPlanRowHtml(row) {
                return "<tr>" +
                    "<td>" + escapeHtml(text(row && (row.specificObjective || row.objectives), "N/A")) + "</td>" +
                    "<td>" + escapeHtml(text(row && row.activities, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "<td>" + escapeHtml(text(row && row.timeframe, "N/A")) + "</td>" +
                    "<td>" + escapeHtml(text(row && row.personResponsible, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "<td>" + escapeHtml(text(row && row.materialsNeeded, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "<td>" + escapeHtml(text(row && row.expectedOutput, "N/A")).replace(/\n/g, "<br />") + "</td>" +
                    "</tr>";
            }

            function shouldUsePagedJsEngine() {
                try {
                    if (IS_PRINT_MODE) {
                        return false;
                    }
                    return PAGE_PARAMS.get("engine") === "pagedjs";
                } catch (_) {
                    return false;
                }
            }

            function buildInfoRow(label, fieldName) {
                return "<div class=\"info-label\">" + escapeHtml(label) + "</div>" +
                    "<div class=\"info-value\"><span class=\"info-colon\">:</span><span data-csr-field=\"" + escapeHtml(fieldName) + "\"></span></div>";
            }

            function buildPagedJsFlowHtml(payload) {
                const caseHtml = getNormalizedNarrativeHtml(payload && payload.presentingProblem && payload.presentingProblem.html);
                const backgroundSocioEconomicHtml = getBackgroundTabHtml(payload, "socioEconomic");
                const backgroundHealthConditionHtml = getBackgroundTabHtml(payload, "healthCondition");
                const backgroundEnvironmentalHtml = getBackgroundTabHtml(payload, "environmentalLivingConditions");
                const backgroundCommunityHtml = getBackgroundTabHtml(payload, "environmentCommunity");
                const familyRows = Array.isArray(payload && payload.familyComposition) ? payload.familyComposition : [];
                const plans = Array.isArray(payload && payload.interventionPlanImplementation) ? payload.interventionPlanImplementation : [];
                const caseAssessmentHtml = getNormalizedNarrativeHtml(payload && payload.caseAssessment && payload.caseAssessment.html);
                const caseManagementEvaluationHtml = getNormalizedNarrativeHtml(
                    payload && payload.caseManagementEvaluation && payload.caseManagementEvaluation.html
                );
                const recommendationBlocks = getNarrativeBlocksFromPlainText(
                    payload && payload.recommendation && payload.recommendation.recommendationText
                );

                const familyRowsHtml = familyRows.map((row) => buildFamilyRowHtml(row)).join("");
                const planRowsHtml = plans.map((row) => buildPlanRowHtml(row)).join("");

                return "" +
                    "<div class=\"running-header\">" +
                    "<div class=\"flex justify-between items-start\">" +
                    "<div class=\"flex flex-col\"><div class=\"flex items-center gap-3 mt-1\"><img src=\"../assets/dswd_logo.png\" alt=\"DSWD logo\" class=\"h-10 w-auto object-contain\" />" +
                    "<img src=\"../assets/bagong_pilipinas.png\" alt=\"Bagong Pilipinas logo\" class=\"h-10 w-auto object-contain\" /></div></div>" +
                    "<div class=\"header-text uppercase leading-tight mt-1\"><div>Pantawid Pamilyang Pilipino Program</div><div>Field Office VII</div><div>DSWD-GF-004 | Rev 03 | 22 Sep 2023</div></div>" +
                    "</div><div class=\"flow-header-line\"></div></div>" +
                    "<div class=\"running-footer\">" +
                    "<div class=\"flex flex-col items-center\"><p class=\"page-counter\"></p></div></div>" +
                    "<section class=\"section-gap\">" +
                    "<p class=\"text-[12pt] font-normal mb-8\">CM Form No. 4</p>" +
                    "<h1 class=\"text-[18pt] font-bold text-center mb-6\">SOCIAL CASE STUDY REPORT (SCSR)</h1>" +
                    "<div class=\"mb-4 w-full\"><div class=\"flex items-baseline gap-2\"><span class=\"font-bold text-[12pt]\">Date:</span><span data-csr-field=\"date\" class=\"text-[12pt] border-b border-black min-w-[140px]\"></span></div></div>" +
                    "</section>" +
                    "<section class=\"section-gap\">" +
                    "<h2 class=\"font-bold text-[12pt] mb-2\">I. Identifying Information:</h2>" +
                    "<div class=\"info-grid\">" +
                    buildInfoRow("Household ID Number", "householdId") +
                    buildInfoRow("Client's Name", "clientName") +
                    buildInfoRow("HH Status", "clientStatusOnExit") +
                    buildInfoRow("HH Set Group", "hhSet") +
                    buildInfoRow("Civil Status", "civilStatus") +
                    buildInfoRow("Educational Attainment", "educationalAttainment") +
                    buildInfoRow("Sex", "sex") +
                    buildInfoRow("Birthday", "birthday") +
                    buildInfoRow("Age", "age") +
                    buildInfoRow("Place of Birth", "placeOfBirth") +
                    buildInfoRow("Religion", "religion") +
                    buildInfoRow("IP Affiliation", "ipAffiliation") +
                    buildInfoRow("Source of Income", "sourceOfIncome") +
                    buildInfoRow("Monthly Income", "monthlyIncome") +
                    buildInfoRow("Per Capita Income", "perCapitaIncome") +
                    buildInfoRow("Level of Well-Being", "levelOfWellBeing") +
                    buildInfoRow("Present Address", "presentAddress") +
                    buildInfoRow("Contact Number", "contactInfo") +
                    "</div></section>" +
                    "<section class=\"section-gap\">" +
                    "<h2 class=\"font-bold text-[12pt] mb-2 uppercase\">II. Family Composition</h2>" +
                    "<table class=\"report-table family-composition-table text-left border-black\">" +
                    "<colgroup><col class=\"col-name\" /><col class=\"col-sex\" /><col class=\"col-age\" /><col class=\"col-civil\" /><col class=\"col-rel\" />" +
                    "<col class=\"col-check\" /><col class=\"col-check\" />" +
                    "<col class=\"col-educ\" /><col class=\"col-occup\" /><col class=\"col-income\" /><col class=\"col-disability\" /></colgroup>" +
                    "<thead><tr><th>Name</th><th>Sex</th><th>Age</th><th>Birthday</th><th>Relationship to the Client</th>" +
                    "<th colspan=\"2\">Monitored Child</th><th>Educ. Attainment</th><th>Occupation</th><th>Monthly Income</th><th>Type of Disability(if applicable)</th></tr></thead>" +
                    "<tbody>" + familyRowsHtml + "</tbody></table></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">III. PRESENTING PROBLEM</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" + caseHtml + "</div></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">IV. BACKGROUND INFORMATION</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" +
                    ((text(backgroundSocioEconomicHtml) || text(backgroundHealthConditionHtml) || text(backgroundEnvironmentalHtml))
                        ? "<p class=\"font-bold mb-3\">A. The Family</p>" +
                        (text(backgroundSocioEconomicHtml) ? "<p class=\"font-bold mb-3 ml-[1.27cm]\">Socio-Economic</p>" + getNormalizedNarrativeHtml(backgroundSocioEconomicHtml) : "") +
                        (text(backgroundHealthConditionHtml) ? "<p class=\"font-bold mb-3 ml-[1.27cm]\">Health Condition</p>" + getNormalizedNarrativeHtml(backgroundHealthConditionHtml) : "") +
                        (text(backgroundEnvironmentalHtml) ? "<p class=\"font-bold mb-3 ml-[1.27cm]\">Environmental and Living Condition</p>" + getNormalizedNarrativeHtml(backgroundEnvironmentalHtml) : "")
                        : "") +
                    (text(backgroundCommunityHtml)
                        ? "<p class=\"font-bold mb-3\">B. The Environment / Community</p>" + getNormalizedNarrativeHtml(backgroundCommunityHtml)
                        : "") +
                    "</div></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">V. CASE ASSESSMENT</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" + caseAssessmentHtml + "</div></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">VI. INTERVENTION PLAN/PLAN IMPLEMENTATION</h2>" +
                    "<table class=\"report-table doc-text w-full\"><colgroup><col style=\"width:16%\" /><col style=\"width:22%\" /><col style=\"width:12%\" /><col style=\"width:16%\" /><col style=\"width:16%\" /><col style=\"width:18%\" /></colgroup>" +
                    "<thead><tr><th>Specific Objective</th><th>Activities</th><th>Timeframe</th><th>Person Responsible</th><th>Materials Needed</th><th>Expected Output</th></tr></thead>" +
                    "<tbody>" + planRowsHtml + "</tbody></table></section>" +
                    "<section class=\"section-gap\"><h2 class=\"font-bold text-[12pt] mb-2 uppercase\">VII. CASE MANAGEMENT EVALUATION</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" + caseManagementEvaluationHtml + "</div></section>" +
                    "<section class=\"section-gap recommendation-combined-section\">" +
                    "<h2 class=\"font-bold text-[12pt] mb-2 uppercase\">VIII. CASE RECOMMENDATION</h2>" +
                    "<div class=\"text-[12pt] leading-[1.2] text-justify case-development-body\">" +
                    recommendationBlocks.map((node) => {
                        const wrapper = document.createElement("div");
                        wrapper.appendChild(node.cloneNode(true));
                        return wrapper.innerHTML;
                    }).join("") +
                    "</div>" +
                    "<div class=\"mt-8 flex flex-col gap-y-10\">" +
                    "<div><p class=\"mb-6\">Prepared by:</p><p class=\"font-bold uppercase mb-1\" data-csr-field=\"preparedBy\"></p><p class=\"leading-tight\">PDO II-Municipal Link</p><div class=\"flex items-end gap-2 mt-1\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div>" +
                    "<div><p class=\"mb-6\">Reviewed by:</p><p class=\"font-bold uppercase mb-1\" data-csr-field=\"reviewedBy\"></p><p class=\"leading-tight\">Social Welfare Officer III</p><div class=\"flex items-end gap-2 mt-1\"><span>Date:</span><span class=\"border-b border-black w-24\"></span></div></div>" +
                    "<div><p class=\"mb-6\">Noted by:</p><p class=\"font-bold uppercase mb-1\" data-csr-field=\"approvedBy\"></p><p class=\"leading-tight\">Provincial Link</p></div>" +
                    "</div></section>";
            }

            async function renderWithPagedJs(payload, fields) {
                if (!window.PagedPolyfill || typeof window.PagedPolyfill.preview !== "function" || !pageRoot) {
                    return false;
                }
                document.body.classList.add("pagedjs-engine");
                pageRoot.innerHTML = "";
                const flow = document.createElement("div");
                flow.id = "csr-flow-doc";
                flow.className = "csr-flow-doc";
                flow.innerHTML = buildPagedJsFlowHtml(payload);
                pageRoot.appendChild(flow);
                Object.keys(fields).forEach((key) => setField(key, fields[key]));
                try {
                    await window.PagedPolyfill.preview(flow, [], pageRoot);
                    return true;
                } catch (_) {
                    return false;
                }
            }

            async function renderPayload(payload, renderSeq) {
                if (!payload) {
                    setExportRenderReady(false);
                    return;
                }
                const basicInfo = payload.basicInfo || {};
                const recommendation = payload.recommendation || {};
                const mapNotShared = (value) => {
                    const normalized = String(value == null ? "" : value).trim();
                    if (!normalized) {
                        return "Not shared";
                    }
                    const upper = normalized.toUpperCase();
                    if (upper === "NONE" || upper === "N/A" || upper === "NA") {
                        return "Not shared";
                    }
                    return normalized;
                };
                const fields = {
                    date: formatIsoDate(basicInfo.date),
                    clientName: basicInfo.clientName || basicInfo.granteeName,
                    householdId: basicInfo.householdId,
                    hhSet: basicInfo.hhSet,
                    sourceOfIncome: basicInfo.sourceOfIncome,
                    monthlyIncome: formatPesoDisplay(basicInfo.monthlyIncome),
                    perCapitaIncome: formatPesoDisplay(basicInfo.perCapitaIncome),
                    sex: toTitleCaseDisplay(basicInfo.sex),
                    birthday: basicInfo.birthday,
                    age: basicInfo.age,
                    placeOfBirth: basicInfo.placeOfBirth,
                    civilStatus: basicInfo.civilStatus,
                    presentAddress: basicInfo.presentAddress,
                    educationalAttainment: basicInfo.educationalAttainment,
                    contactInfo: mapNotShared(basicInfo.contactInfo),
                    religion: basicInfo.religion,
                    ipAffiliation: basicInfo.ipAffiliation,
                    levelOfWellBeing: basicInfo.levelOfWellBeing,
                    clientStatusOnExit: basicInfo.clientStatusOnExit,
                    preparedBy: recommendation.preparedBy,
                    reviewedBy: recommendation.reviewedBy,
                    approvedBy: recommendation.approvedBy,
                };
                if (shouldUsePagedJsEngine()) {
                    const ok = await renderWithPagedJs(payload, fields);
                    if (!ok) {
                        document.body.classList.remove("pagedjs-engine");
                        paginateAllSections(payload);
                        Object.keys(fields).forEach((key) => setField(key, fields[key]));
                        updateDynamicFooterPageNumbers();
                    }
                    await markRenderSettled(renderSeq);
                    return;
                }
                paginateAllSections(payload);
                Object.keys(fields).forEach((key) => setField(key, fields[key]));
                updateDynamicFooterPageNumbers();
                await markRenderSettled(renderSeq);
            }

            async function scheduleRender(payload) {
                window.__CSR_EXPORT_RENDER_SEQ__ += 1;
                const renderSeq = window.__CSR_EXPORT_RENDER_SEQ__;
                setExportRenderReady(false);
                try {
                    await renderPayload(payload, renderSeq);
                } catch (error) {
                    // Fail open so export/print does not hang forever on unexpected render errors.
                    console.error("CSR render failed:", error);
                    if (renderSeq === window.__CSR_EXPORT_RENDER_SEQ__) {
                        setExportRenderReady(true);
                    }
                }
            }

            let initialPayload = null;
            let postLoadRenderScheduled = false;

            function schedulePostLoadStabilizationRender() {
                if (postLoadRenderScheduled) {
                    return;
                }
                postLoadRenderScheduled = true;
                // Run one delayed pass after initial paint/fonts settle to avoid clipped content.
                setTimeout(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }, 320);
            }

            readPayload().then((payload) => {
                initialPayload = payload;
                void scheduleRender(initialPayload);
                schedulePostLoadStabilizationRender();
            }).catch((error) => {
                console.error("CSR payload read failed:", error);
                setExportRenderReady(true);
            });

            if (document && document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
                document.fonts.ready.then(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }).catch(() => {
                    // Ignore font API failures and keep render flow running.
                });
            }

            let resizeTimer = null;
            window.addEventListener("resize", () => {
                if (IS_PRINT_MODE) {
                    return;
                }
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(() => {
                    if (initialPayload) {
                        void scheduleRender(initialPayload);
                    }
                }, 140);
            });
        })();
