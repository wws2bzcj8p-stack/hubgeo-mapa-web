(() => {
  let enhanced = false;

  const style = document.createElement('style');
  style.id = 'hubgeo-map-enhancements-style';
  style.textContent = `
    .hubgeo-province-badge{display:none!important}
    .hubgeo-point-marker{
      opacity:1!important;
      stroke-opacity:1!important;
      pointer-events:auto!important;
      filter:drop-shadow(0 1px 2px rgba(11,45,74,.34));
      transition:opacity .18s ease,fill-opacity .18s ease,stroke-width .18s ease,r .18s ease;
    }
  `;
  document.head.appendChild(style);

  function markerSize(z) {
    if (z <= 4) return 2.2;
    if (z === 5) return 2.8;
    if (z === 6) return 3.6;
    if (z <= 8) return 4.6;
    if (z <= 10) return 5.8;
    if (z <= 12) return 6.8;
    return 7.6;
  }

  function removeProvinceBadges() {
    document.querySelectorAll('.hubgeo-province-badge').forEach(node => node.remove());
  }

  function refreshPointMarkers() {
    removeProvinceBadges();
    if (!map || !layer) return;
    const z = map.getZoom();

    layer.eachLayer(marker => {
      if (typeof marker.setRadius !== 'function') return;
      marker.setRadius(markerSize(z));

      if (typeof marker.setStyle === 'function') {
        marker.setStyle({
          weight: z <= 5 ? .8 : 1.4,
          color: '#ffffff',
          opacity: 1,
          fillOpacity: z <= 4 ? .62 : z === 5 ? .74 : .92
        });
      }

      const node = marker.getElement?.();
      if (node) {
        node.classList.add('hubgeo-point-marker');
        node.style.opacity = '1';
        node.style.pointerEvents = 'auto';
      }
    });
  }

  function install() {
    if (enhanced || typeof render !== 'function') return;
    enhanced = true;

    removeProvinceBadges();

    const originalRender = render;
    render = function () {
      originalRender.apply(this, arguments);
      requestAnimationFrame(refreshPointMarkers);
    };

    const waitForMap = setInterval(() => {
      if (!map) return;
      clearInterval(waitForMap);
      map.on('zoomend', refreshPointMarkers);
      map.on('moveend', refreshPointMarkers);
      refreshPointMarkers();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();