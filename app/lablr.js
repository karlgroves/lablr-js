document.addEventListener("DOMContentLoaded", function(event) {

  const els = [];

  /**
   * @param {*} array
   */
  function postArrayToServer(array) {
    const url = 'http://localhost:3000/lablr';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(array),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Elements successfully sent to the server!');
      })
      .catch((error) => {
        if (error instanceof TypeError) {
          console.error('A TypeError occurred:', error.message);
        } else if (error instanceof SyntaxError) {
          console.error('A SyntaxError occurred:', error.message);
        } else if (error instanceof NetworkError) {
          console.error('A NetworkError occurred:', error.message);
        } else if (error instanceof DOMException) {
          console.error('A DOMException occurred:', error.message);
        } else {
          console.error('An unknown error occurred:', error);
        }
      });
  }

  /**
   * @param {*} selector
   * @param {*} category
   * @returns
   */
  function assembleEls(selector, category) {
    const elements = document.querySelectorAll(selector);
    const result = [];

    if (elements.length === 0) {
      return result; // Return an empty array instead of false
    }

    for (const element of elements) {
      // Skip elements with the className 'lablr-label-added'
      if (element.classList.contains('lablr-label-added') === false) {

        const { tagName } = element;
        const { x, y, width, height } = element.getBoundingClientRect();
        const xpath = getXPath(element);
        const outerHtml = element.outerHTML.slice(0, 255); // Truncate outerHtml
        const textContent = element.textContent.trim();
        const accessibleName = element.getAccessibleName(element);

        const obj = {
          tagName,
          category,
          location: { x, y, width, height },
          xpath,
          outerHtml,
          textContent,
          accessibleName,
        };

        result.push(obj);
      }
    }

    return result;
  }

  /**
   * @param {*} element
   * @returns
   */
  function getXPath(element) {
    const xpath = [];
    for (; element && element.nodeType === Node.ELEMENT_NODE; element = element.parentNode) {
      let siblingCount = 0;
      let siblingIndex = 0;
      let prevSibling = element.previousElementSibling;

      while (prevSibling) {
        if (prevSibling.nodeName === element.nodeName) {
          siblingCount++;
        }
        prevSibling = prevSibling.previousElementSibling;
      }

      let tagName = element.nodeName.toLowerCase();
      if (siblingCount > 0) {
        siblingIndex = siblingCount + 1;
        tagName += `[${siblingIndex}]`;
      }
      xpath.unshift(tagName);
    }
    return xpath.join("/");
  }

  const selectors = [
    { selector: '*[alt]:not(img), *[alt]:not([role=img])', category: 'elsWithAlt' }, // Modified selector for elements with alt attributes not being images
    { selector: '*[aria-describedby], *[aria-labelledby]', category: 'elseWithReferencedAria' },
    { selector: '*[aria-label], *[aria-labelledby]', category: 'elsWithAriaLabels' },
    { selector: '*[lang]', category: 'elsWithLangAttr' },
    { selector: 'a[href], *[role="link"]', category: 'links' },
    { selector: 'abbr, acronym', category: 'acronyms' },
    { selector: 'area', category: 'areas' },
    { selector: 'button, input, meter, output, progress, select, textarea', category: 'formFields' },
    { selector: 'button, *[role="button"]', category: 'buttons' },
    { selector: 'fieldset', category: 'fieldsets' },
    { selector: 'frame, iframe', category: 'frames' },
    { selector: 'img, *[role=img]', category: 'images' },
    { selector: 'legend', category: 'legends' },
    { selector: 'nav, *[role=navigation]', category: 'navs' },
    { selector: 'optgroup', category: 'optgroups' },
    { selector: 'table', category: 'tables' },
    { selector: 'title', category: 'titles' }
  ];

  for (const { selector, category } of selectors) {
    const elsArray = assembleEls(selector, category);
    els.push(...elsArray);
  }

  // Filter the els array to include only unique elements
  const filteredEls = Object.values(els.reduce((acc, el) => {
    const key = JSON.stringify(el);
    if (!acc[key]) {
      acc[key] = el;
    }
    return acc;
  }, {}));

  console.log(filteredEls);

  postArrayToServer(filteredEls);

});
