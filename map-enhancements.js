(() => {
  let provinceLayer = null;
  let enhanced = false;
  const AGGREGATE_FROM_ZOOM = 7;

  const style = document.createElement('style');
  style.textContent = `
    .hubgeo-point-marker{
      filter:drop-shadow(0 1px 2px rgba(11,45,74,.34));
      transition:opacity .18s ease,fill-opacity .18s ease,stroke-width .18s ease;
    }
    .hubgeo-province-badge{
      transform:translate(-50%,-50%);
      pointer-events:none;
      white-space:nowrap;
    }
    .hubgeo-province-badge .box{
      min-width:92px;
      padding:8px 10px;
      border-radius:13px;
      background:rgba(11,45,74,.94);
      color:#fff;
      border:2px solid rgba(255,255,255,.96);
      box-shadow:0 4px 14px rgba(11,45,74,.28);
      text-align:center;
      line-height:1.05;
      backdrop-filter:blur(2px);
    }
    .hubgeo-province-badge b{display:block;font-size:15px;letter-spacing:.01em}
    .hubgeo-province-badge span{display:block;margin-top:4px;font-size:9px;font-weight:800;opacity:.98;text-transform:uppercase;letter-spacing:.05em}
    .hubgeo-province-badge small{display:block;margin-top:3px;font-size:8px;opacity:.78;max-width:120px;overflow:hidden;text-overflow:ellipsis}
  `;
  document.head.appendChild(style);

  const sampleCount = p => {
    const x = Number(p?.qtde_amostras);
    return Number.isFinite(x) && x > 0 ? x : 0;
  };

  function markerSize(z) {
    if (z <= 4) return 2.2;
    if (z === 5) return 2.8;
    if (z === 6) return 3.8;
    return 4.4;
  }

  function isProvinceMode() {
    return !!map && map.getZoom() >= AGGREGATE_FROM_ZOOM;
  }

  function stylePointMarkers() {
    if (!map || !layer) return;
    const z = map.getZoom();
    const grouped = isProvinceMode();

    layer.eachLayer(marker => {
      if (typeof marker.setRadius !== 'function') return;
      marker.setRadius(markerSize(z));
      if (typeof marker.setStyle === 'function') {
        marker.setStyle({
          weight: grouped ? 0 : (z <= 5 ? .8 : 1.3),
          color: '#ffffff',
          opacity: grouped ? 0 : 1,
          fillOpacity: grouped ? 0 : (z <= 4 ? .58 : z === 5 ? .72 : .88)
        });
      }
      const node = marker.getElement?.();
      if (node) {
        node.classList.add('hubgeo-point-marker');
        node.style.pointerEvents = grouped ? 'none' : 'auto';
      }
    });
  }

  function provinceSummary() {
    const src = Array.isArray(visible) ? visible : [];
    const bounds = map?.getBounds?.();
    const groups = new Map();

    src.forEach(p => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const province = String(p.provincia || 'Sem província').trim();
      if (!groups.has(province)) {
        groups.set(province, {
          province,
          samples: 0,
          points: 0,
          viewLat: 0,
          viewLng: 0,
          viewCount: 0
        });
      }

      const g = groups.get(province);
      g.samples += sampleCount(p);
      g.points += 1;

      if (!bounds || bounds.contains([lat, lng])) {
        g.viewLat += lat;
        g.viewLng += lng;
        g.viewCount += 1;
      }
    });

    return [...groups.values()]
      .filter(g => g.viewCount > 0)
      .map(g => ({
        ...g,
        lat: g.viewLat / g.viewCount,
        lng: g.viewLng / g.viewCount
      }));
  }

  function drawProvinceSummary() {
    if (!map) return;
    if (!provinceLayer) provinceLayer = L.layerGroup().addTo(map);
    provinceLayer.clearLayers();
    if (!isProvinceMode()) return;

    provinceSummary().forEach(g => {
      const samples = g.samples === 1 ? '1 amostra' : `${g.samples} amostras`;
      const points = g.points === 1 ? '1 ponto' : `${g.points} pontos`;
      const icon = L.divIcon({
        className: 'hubgeo-province-badge',
        html: `<div class="box"><b>${samples}</b><span>${g.province}</span><small>${points}</small></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      L.marker([g.lat, g.lng], {
        icon,
        interactive: false,
        zIndexOffset: 1200
      }).addTo(provinceLayer);
    });
  }

  function refreshMapEnhancements() {
    if (!map || !layer) return;
    stylePointMarkers();
    drawProvinceSummary();
  }

  function install() {
    if (enhanced || typeof render !== 'function') return;
    enhanced = true;

    const originalRender = render;
    render = function () {
      originalRender.apply(this, arguments);
      requestAnimationFrame(refreshMapEnhancements);
    };

    const waitForMap = setInterval(() => {
      if (!map) return;
      clearInterval(waitForMap);
      map.on('zoomend', refreshMapEnhancements);
      map.on('moveend', refreshMapEnhancements);
      refreshMapEnhancements();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
