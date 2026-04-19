/**
 * FD Laddering Chart Renderer — Chart.js
 *
 * Renders an animated horizontal bar chart visualizing the FD laddering plan.
 * Each bar represents one FD tranche: principal (invested) vs. interest earned.
 * Logos are pre-loaded via Promise.all before chart creation to guarantee rendering.
 */

'use strict';

const FDChart = (() => {
  let chartInstance = null;

  /**
   * Render the FD laddering visualization inside #ladder-chart.
   * Destroys any existing chart instance before creating a new one.
   *
   * @param {Object[]} slices - Array of FD slice objects from the plan API
   * @param {string} lang - Current language code (hi, bho, mr, en)
   * @param {string[]} logoUrls - Array of logo URLs mapped to each slice
   */
  function renderLadder(slices, lang = 'hi', logoUrls = []) {
    destroy();

    const canvas = document.getElementById('ladder-chart');
    if (!canvas) return;

    // Localized strings
    const STR_PRINCIPAL = { hi: 'मूल निवेश (₹)', bho: 'मूल पइसा (₹)', mr: 'मूळ गुंतवणूक (₹)', en: 'Principal Invested (₹)' }[lang] || 'Principal (₹)';
    const STR_INTEREST  = { hi: 'ब्याज से कमाई (₹)', bho: 'ब्याज से कमाई (₹)', mr: 'व्याज कमाई (₹)', en: 'Interest Earned (₹)' }[lang] || 'Interest (₹)';
    const STR_MO        = { hi: 'महीने', bho: 'महिना', mr: 'महिने', en: 'mo' }[lang] || 'mo';

    // Devanagari numerals for non-English
    const devNum = (num) => {
      if (lang === 'en') return String(num);
      const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return String(num).replace(/[0-9]/g, d => map[d]);
    };

    // Bank name displayed on Y-axis (first word of localized name)
    const getShortLabel = (slice) => {
      const short = slice.bank_short_name || slice.bank_name || '';
      // Map to concise label
      if (short === 'Post Office' || slice.bank_name.includes('Post Office')) {
        return lang === 'en' ? 'Post Office' : 'पोस्ट ऑफिस';
      }
      if (short === 'SBI' || slice.bank_name.includes('State Bank')) {
        return 'SBI';
      }
      if (short === 'HDFC' || slice.bank_name.includes('HDFC')) {
        return 'HDFC';
      }
      if (short === 'ICICI' || slice.bank_name.includes('ICICI')) {
        return 'ICICI';
      }
      if (short === 'AU SFB' || slice.bank_name.includes('AU ')) {
        return lang === 'en' ? 'AU SFB' : 'एयू';
      }
      if (short === 'Unity SFB' || slice.bank_name.includes('Unity')) {
        return lang === 'en' ? 'Unity SFB' : 'यूनिटी';
      }
      if (short === 'Jana SFB' || slice.bank_name.includes('Jana')) {
        return lang === 'en' ? 'Jana SFB' : 'जना';
      }
      if (short === 'Suryoday SFB' || slice.bank_name.includes('Suryoday')) {
        return lang === 'en' ? 'Suryoday' : 'सूर्योदय';
      }
      return short.split(' ')[0];
    };

    const labels = slices.map(s => `${getShortLabel(s)} · ${devNum(s.tenure_months)} ${STR_MO}`);
    const principals = slices.map(s => parseFloat(s.principal.toFixed(2)));
    const interests  = slices.map(s => parseFloat((s.maturity_amount - s.principal).toFixed(2)));

    // ── Pre-load ALL logos before building the chart ──────────────────────────
    // Using Promise.all guarantees every image is decoded before afterDraw runs.
    const loadPromises = logoUrls.map((url, i) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve({ img, index: i });
      img.onerror = () => {
        // On error, create a 1×1 transparent placeholder so the slot exists
        const ph = new Image(1, 1);
        ph.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        resolve({ img: ph, index: i });
      };
      img.src = url;
    }));

    Promise.all(loadPromises).then((results) => {
      // Index-aligned array of loaded Image objects
      const loaded = [];
      results.forEach(r => { loaded[r.index] = r.img; });

      // ── Custom plugin: draw logos on Y-axis left of each bar ─────────────
      const drawAxisLogosPlugin = {
        id: 'drawAxisLogos',
        afterDraw(chart) {
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(0);
          const yAxis = chart.scales.y;

          meta.data.forEach((bar, index) => {
            const img = loaded[index];
            if (!img) return; // Base64 SVGs always have naturalWidth > 0

            const y = bar.y;       // bar center y
            const size = 24;       // Slightly larger for better visibility
            // Place logo just to the left of the first bar start,
            // inside the y-axis tick-label padding zone (40px).
            const x = yAxis.right - 32;

            ctx.save();

            // White circular background
            ctx.beginPath();
            ctx.arc(x + size / 2, y, size / 2 + 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Clip to circle and draw logo
            ctx.beginPath();
            ctx.arc(x + size / 2, y, size / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, x, y - size / 2, size, size);

            ctx.restore();
          });
        }
      };

      // ── Build Chart.js instance ───────────────────────────────────────────
      chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: STR_PRINCIPAL,
              data: principals,
              backgroundColor: 'rgba(139, 92, 246, 0.7)',
              borderColor:     'rgba(139, 92, 246, 1)',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: STR_INTEREST,
              data: interests,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor:     'rgba(16, 185, 129, 1)',
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          animation: { duration: 800, easing: 'easeOutQuart' },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#A8B3CF',
                font: { family: 'DM Sans', size: 11 },
                boxWidth: 12,
                padding: 16,
              },
            },
            tooltip: {
              backgroundColor: '#111827',
              borderColor: 'rgba(245,166,35,0.3)',
              borderWidth: 1,
              titleColor: '#F0F4FF',
              bodyColor: '#A8B3CF',
              callbacks: {
                label: (ctx) => {
                  const val = ctx.parsed.x;
                  return ` ${ctx.dataset.label.replace(' (₹)', '')}: ₹${val.toLocaleString('en-IN')}`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: '#4B5563',
                font: { family: 'JetBrains Mono', size: 10 },
                callback: (val) => `₹${(val / 1000).toFixed(0)}K`,
              },
              grid: { color: 'rgba(255,255,255,0.04)' },
            },
            y: {
              stacked: true,
              ticks: {
                color: '#A8B3CF',
                font: { family: 'DM Sans', size: 11 },
                padding: 40, // space for the 22px logo circle
              },
              grid: { color: 'rgba(255,255,255,0.04)' },
            },
          },
        },
        plugins: [drawAxisLogosPlugin],
      });
    });
  }

  function destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  return { renderLadder, destroy };
})();
