function applyLabels() {
  fetch('labels.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const elements = document.evaluate(item.XPath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < elements.snapshotLength; i++) {
          const element = elements.snapshotItem(i);
          const accessibleName = item.accessibleName;

          if (element.nodeName.toLowerCase() === 'title') {
            element.innerText = accessibleName;
          } else {
            element.setAttribute('aria-label', accessibleName);
          }

          element.classList.add('lablr-label-added');
        }
      });
    })
    .catch(error => {
      console.error('Error reading labels.json:', error);
    });
}

document.addEventListener('DOMContentLoaded', applyLabels);
