document.addEventListener("DOMContentLoaded", function(event) {

  /**
   *
   * @param {*} str
   * @returns
   */
  function isEmpty(str) {
    str = str.trim();

    switch (str) {
      case '':
      case ' ':
      case null:
      case false:
      case undefined:
        return true;
      default:
        return false;
    }
  }

  /**
   *
   * @param {*} str
   * @returns
   */
  function isString(str) {
    return typeof str === 'string' || str instanceof String;
  }

  /**
   *
   * @param {*} str
   * @returns
   */
  function strlen(str) {
    if (isString(str)) {
      str = str.trim();
      if (!isEmpty(str)) {
        return str.length;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  /**
   *
   * @returns
   */
  Element.prototype.isVisible = function () {
    var self = this;

    if (!self || !(self instanceof Element)) {
      return false;
    }

    var id = self.getAttribute('id');
    var nodeType = self.nodeType;
    var nonvisible =
      'head *, br, nobr, col, embed, hr, input[type=\'hidden\'], keygen, source, track, wbr,  datalist, ' +
      'area, param, noframes, ruby > rp';

    if (self.matches && self.matches(nonvisible)) {
      return true;
    }

    var labelledBy = document.querySelectorAll(
      '*[aria-labelledby~="' + id + '"],*[aria-describedby~="' + id + '"]'
    );
    for (var i = 0; i < labelledBy.length; i++) {
      var label = labelledBy[i];
      if (label && label instanceof Element && getComputedStyle(label).display !== 'none') {
        return true;
      }
    }

    if (nodeType === 1 && self && self instanceof Element && getComputedStyle(self).display !== 'none') {
      return true;
    }

    var parents = self.parentNode;
    while (parents && parents instanceof Element) {
      if (getComputedStyle(parents).display === 'none') {
        return false;
      }
      parents = parents.parentNode;
    }

    return true;
  };




  /**
   *
   * @returns
   */
  Element.prototype.a11yText = function () {
    function getAllText(el) {
      var walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_ALL,
        null,
        false
      );
      var node, text;
      var textNodes = [];

      while ((node = walker.nextNode())) {
        if (node.nodeType === 3) {
          text = node.nodeValue.trim();

          if (text) {
            textNodes.push(text);
          } else {
            textNodes.push(node.textContent.trim());
          }
        } else if (node.nodeType === 1) {
          if (node.hasAttribute('aria-label')) {
            textNodes.push(node.getAttribute('aria-label'));
          } else if (node.tagName === 'IMG') {
            textNodes.push(node.alt);
          }
        }
      }

      return textNodes.join(' ');
    }

    var arr = [];
    var elements = document.querySelectorAll(':scope');
    for (var i = 0; i < elements.length; i++) {
      arr.push(getAllText(elements[i]));
    }

    return arr.join(' ');
  };


  document.querySelectorAll(':scope').forEach(function (elem) {
    elem.matches = elem.matches || elem.msMatchesSelector;
    elem.closest = elem.closest || function closest(selector) {
      var el = this;
      while (el) {
        if (el.matches(selector)) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };
  });

  /**
   *
   * @returns
   */
  Element.prototype.hasText = function () {
    if (this.a11yText().trim() !== '') {
      return true;
    }
    return false;
  };

  /**
   *
   * @returns
   */
  Element.prototype.getAccessibleName = function () {
    var self = this;
    var id, ids, label;
    var unlabellable =
      'head *, hr, param, caption, colgroup, col, tbody, tfoot, thead, tr';

    if (!self.isVisible() || self.matches(unlabellable)) {
      return false;
    }

    if (self.hasAttribute('aria-labelledby')) {
      ids = self.getAttribute('aria-labelledby').trim().split(' ');

      var text = [];
      for (var i = 0; i < ids.length; i++) {
        var labelElement = document.getElementById(ids[i]);
        if (!labelElement.a11yText()) {
          return false;
        }
        text.push(labelElement.a11yText());
      }

      return text.join(' ');
    }

    if (self.hasAttribute('aria-label')) {
      var ariaLabel = self.getAttribute('aria-label');
      if (ariaLabel) {
        return ariaLabel;
      }
    }

    if (self.hasAttribute('role')) {
      var roleValue = self.getAttribute('role');
      if (
        [
          'button',
          'checkbox',
          'columnheader',
          'gridcell',
          'heading',
          'link',
          'listitem',
          'menuitem',
          'menuitemcheckbox',
          'menuitemradio',
          'option',
          'radio',
          'row',
          'rowgroup',
          'rowheader',
          'tab',
          'tooltip',
          'treeitem'
        ].indexOf(roleValue) !== -1
      ) {
        if (!isEmpty(self.textContent.trim())) {
          return self.a11yText();
        }
      }
    }

    if (
      [
        'input:not([type])',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="password"]',
        'input[type="search"]',
        'input[type="tel"]',
        'input[type="url"]',
        'textarea'
      ].indexOf(self.tagName.toLowerCase()) !== -1
    ) {
      if (self.hasAttribute('id')) {
        id = self.getAttribute('id');

        label = document.querySelector('label[for="' + id + '"]');
        if (label !== null) {
          return label.a11yText();
        }
      }

      var parentLabel = self.closest('label');
      if (parentLabel !== null) {
        return parentLabel.a11yText();
      }

      if (self.hasAttribute('title')) {
        if (strlen(self.getAttribute('title')) > 0) {
          return self.getAttribute('title');
        } else {
          return false;
        }
      }

      return false;
    }

    if (
      [
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]'
      ].indexOf(self.tagName.toLowerCase()) !== -1
    ) {
      if (self.hasAttribute('value')) {
        if (self.getAttribute('value')) {
          return self.getAttribute('value');
        }
      } else if (self.matches('input[type="button"]')) {
        if (self.hasAttribute('title')) {
          return self.getAttribute('title');
        }
        return false;
      } else if (self.matches('input[type="submit"]')) {
        if (self.hasAttribute('title')) {
          return self.getAttribute('title');
        } else {
          return 'Submit';
        }
      } else if (self.matches('input[type="reset"]')) {
        if (self.hasAttribute('title')) {
          return self.getAttribute('title');
        } else {
          return 'Reset';
        }
      }
    }

    if (self.matches('input[type="image"]')) {
      if (self.hasAttribute('alt')) {
        return self.getAttribute('alt');
      } else if (self.hasAttribute('value')) {
        return self.getAttribute('value');
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (self.matches('button')) {
      if (self.a11yText().trim().length > 0) {
        return self.a11yText();
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (
      [
        'select',
        'input[type="checkbox"]',
        'input[type="color"]',
        'input[type="date"]',
        'input[type="datetime"]',
        'input[type="datetime-local"]',
        'input[type="email"]',
        'input[type="file"]',
        'input[type="month"]',
        'input[type="number"]',
        'input[type="radio"]',
        'input[type="range"]',
        'input[type="time"]',
        'input[type="week"]'
      ].indexOf(self.tagName.toLowerCase()) !== -1
    ) {
      if (self.hasAttribute('id')) {
        id = self.getAttribute('id');

        label = document.querySelector('label[for="' + id + '"]');
        if (label !== null) {
          return label.a11yText();
        }
      }

      var parentLabel = self.closest('label');
      if (parentLabel !== null) {
        return parentLabel.a11yText();
      }

      if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      }

      return false;
    }

    if (self.matches('details')) {
      if (self.querySelector('summary') !== null) {
        if (strlen(self.querySelector('summary').a11yText()) > 0) {
          return self.querySelector('summary').a11yText();
        }
      } else if (self.hasAttribute('title')) {
        if (strlen(self.getAttribute('title')) > 0) {
          return self.getAttribute('title');
        } else {
          return 'Details';
        }
      } else {
        return 'Details';
      }
    }

    if (self.matches('figure')) {
      if (self.querySelector('figcaption') !== null) {
        if (strlen(self.querySelector('figcaption').a11yText()) > 0) {
          return self.querySelector('figcaption').a11yText();
        }
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (self.matches('img')) {
      if (self.hasAttribute('alt')) {
        return self.getAttribute('alt');
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (self.matches('area[href]')) {
      if (self.hasAttribute('alt')) {
        return self.getAttribute('alt');
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (self.matches('applet')) {
      if (self.hasAttribute('alt')) {
        return self.getAttribute('alt');
      } else {
        return false;
      }
    }

    if (self.matches('table')) {
      if (self.querySelector('caption') !== null) {
        if (strlen(self.querySelector('caption').a11yText()) > 0) {
          return self.querySelector('caption').a11yText();
        }
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else if (self.hasAttribute('summary')) {
        return self.getAttribute('summary');
      }
      return false;
    }

    if (self.matches('a[href]')) {
      if (strlen(self.a11yText()) > 0) {
        return self.a11yText();
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (
      [
        'em',
        'strong',
        'small',
        's',
        'cite',
        'q',
        'dfn',
        'abbr',
        'time',
        'code',
        'var',
        'samp',
        'kbd',
        'sub',
        'sup',
        'i',
        'b',
        'u',
        'mark',
        'ruby',
        'rt',
        'rp',
        'bdi',
        'bdo',
        'br',
        'wbr'
      ].indexOf(self.tagName.toLowerCase()) !== -1
    ) {
      if (strlen(self.textContent.trim()) > 0) {
        return self.textContent.trim();
      } else if (self.hasAttribute('title')) {
        return self.getAttribute('title');
      } else {
        return false;
      }
    }

    if (strlen(self.a11yText()) > 0) {
      return self.a11yText();
    } else {
      return false;
    }
  };

}, false);
