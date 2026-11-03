/**
 * EtalasePelemwatu — Main JavaScript
 * Landing Page Interactions
 */

'use strict';

// ── Utility ──────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { info: 'bi-info-circle-fill', success: 'bi-check-circle-fill', error: 'bi-x-circle-fill' };
  const colors = { info: 'var(--riviera)', success: '#28a745', error: '#dc3545' };
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.info}" style="color:${colors[type]};font-size:1.2rem;flex-shrink:0"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all .35s ease';
    setTimeout(() => toast.remove(), 380);
  }, duration);
}

// ── Navbar Scroll Effect ──────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('mainNavbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Active nav link based on scroll
  const sections = $$('section[id], div[id]');
  const navLinks = $$('#mainNavbar .nav-link[href*="#"]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href').includes(current) && current !== '');
    });
  }, { passive: true });
}

// ── Back to Top ───────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Counter Animation ─────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start) + (el.dataset.suffix || '');
  }, 16);
}

function initCounters() {
  const counters = $$('.stat-num[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.target));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ── Profil Desa Tabs ──────────────────────────────────────────
function initProfilTabs() {
  const btns = $$('.profil-nav-btn');
  const panes = $$('.profil-tab-pane');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(target);
      if (pane) pane.classList.add('active');
    });
  });
}

// ── Katalog Filter ────────────────────────────────────────────
function initKatalogFilter() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.potensi-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
          card.style.animation = 'fadeInUp .4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ── Katalog Detail Modal ──────────────────────────────────────
const katalogData = {
  'omah-dimsum': {
    nama: 'Omah Dimsum',
    kategori: 'Usaha & Produk',
    emoji: '🥟',
    bg: '#fff0e8',
    deskripsi: 'Usaha kuliner yang menyajikan berbagai jenis dimsum pilihan dengan cita rasa khas. Melayani pembelian langsung maupun pemesanan.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'warung-prasmanan': {
    nama: 'Warung Prasmanan Selarasnasi',
    kategori: 'Usaha & Produk',
    emoji: '🍛',
    bg: '#fff0e8',
    deskripsi: 'Warung makan prasmanan yang menyajikan berbagai menu masakan rumahan. Menjadi pilihan masyarakat sekitar untuk makan siang dan malam.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'ratu-frozen': {
    nama: 'Ratu Frozen Food Pelemwatu',
    kategori: 'Usaha & Produk',
    emoji: '🧊',
    bg: '#fff0e8',
    deskripsi: 'Usaha penjualan frozen food dengan berbagai pilihan produk beku berkualitas. Tersedia untuk kebutuhan rumah tangga dan usaha kuliner.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'moni-laundry': {
    nama: 'Moni Laundry 24 Jam',
    kategori: 'Jasa',
    emoji: '👕',
    bg: '#e8edf5',
    deskripsi: 'Layanan jasa laundry yang beroperasi 24 jam untuk memenuhi kebutuhan pencucian pakaian masyarakat dengan cepat dan bersih.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'one-laundry': {
    nama: 'One Laundry Koin',
    kategori: 'Jasa',
    emoji: '🪙',
    bg: '#e8edf5',
    deskripsi: 'Layanan laundry mandiri berbasis koin yang praktis dan terjangkau. Cocok untuk warga yang ingin mencuci pakaian secara mandiri.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'my-kost': {
    nama: 'My Kost',
    kategori: 'Hunian',
    emoji: '🏠',
    bg: '#f5f0e8',
    deskripsi: 'Hunian kost yang nyaman dan terjangkau di lingkungan Desa Pelemwatu. Tersedia berbagai pilihan kamar yang dapat disesuaikan dengan kebutuhan.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
  'rama-kost': {
    nama: 'RAMA Kost',
    kategori: 'Hunian',
    emoji: '🏡',
    bg: '#f5f0e8',
    deskripsi: 'Pilihan hunian kost dengan fasilitas lengkap di Desa Pelemwatu. Lingkungan nyaman dan strategis untuk warga dan pendatang baru.',
    lokasi: 'Desa Pelemwatu, Kec. Menganti, Kab. Gresik',
    kontak: 'Hubungi melalui formulir pendaftaran',
    status: 'Terverifikasi',
  },
};

function initDetailModal() {
  $$('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const data = katalogData[id];
      if (!data) return;

      const modal = document.getElementById('detailModal');
      if (!modal) return;
      modal.querySelector('.modal-title').textContent = data.nama;
      modal.querySelector('#detail-img').style.background = data.bg;
      modal.querySelector('#detail-emoji').textContent = data.emoji;
      modal.querySelector('#detail-nama').textContent = data.nama;
      modal.querySelector('#detail-kategori').textContent = data.kategori;
      modal.querySelector('#detail-deskripsi').textContent = data.deskripsi;
      modal.querySelector('#detail-lokasi').textContent = data.lokasi;
      modal.querySelector('#detail-status').textContent = data.status;

      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    });
  });
}

// ── Smooth Scroll for Anchor Links ───────────────────────────
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      // Close mobile menu if open
      const toggler = document.querySelector('.navbar-collapse');
      if (toggler && toggler.classList.contains('show')) {
        bootstrap.Collapse.getInstance(toggler)?.hide();
      }
      const navH = document.getElementById('mainNavbar')?.offsetHeight || 70;
      window.scrollTo({ top: el.offsetTop - navH, behavior: 'smooth' });
    });
  });
}

// ── Gallery Item Click ────────────────────────────────────────
function initGallery() {
  $$('.gallery-item').forEach(item => {
    item.addEventListener('click', () => showToast('Foto asli desa akan ditampilkan setelah gambar tersedia.', 'info'));
  });
}

// ── Map Placeholder Click ─────────────────────────────────────
function initMapPlaceholder() {
  const mp = $('.map-placeholder');
  if (mp) mp.addEventListener('click', () => showToast('Peta interaktif akan tersedia setelah koordinat desa dikonfigurasi.', 'info'));
}

// ── Init All ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initProfilTabs();
  initKatalogFilter();
  initDetailModal();
  initSmoothScroll();
  initGallery();
  initMapPlaceholder();
});

