'use strict';
const root = document.documentElement;
function setTheme(theme) {
  root.dataset.theme = theme;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  try { localStorage.setItem('shaimaa-sky-theme', theme); } catch (_) { }
}
let savedTheme;
try { savedTheme = localStorage.getItem('shaimaa-sky-theme'); } catch (_) { }
setTheme(savedTheme === 'dark' ? 'dark' : 'light');
document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.themeChoice)));
document.getElementById('print').addEventListener('click', () => window.print());
const lightbox = document.getElementById('lightbox');
const previewImage = lightbox.querySelector('img');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  previewImage.src = button.dataset.image;
  previewImage.alt = button.dataset.title;
  lightbox.querySelector('p').textContent = button.dataset.title;
  lightbox.showModal();
}));
lightbox.querySelector('.close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

const cloudStage = document.querySelector('.cloud-stage');
const clouds = [...cloudStage.querySelectorAll('.about-cloud')];
const cloudControls = document.querySelector('.cloud-controls');
const previousCloud = cloudControls.querySelector('.cloud-prev');
const nextCloud = cloudControls.querySelector('.cloud-next');
const cloudCount = cloudControls.querySelector('.cloud-count');
const cloudMotion = matchMedia('(prefers-reduced-motion: reduce)');
let cloudIndex = 0;
let swipeStart;

function showCloud(index, direction = 0) {
  if (index < 0 || index >= clouds.length) return;

  const outgoing = clouds[cloudIndex];
  clouds.forEach((cloud, position) => {
    cloud.hidden = position !== index;
    cloud.setAttribute('aria-hidden', String(cloud.hidden));
    cloud.getAnimations().forEach(animation => animation.cancel());
  });
  cloudIndex = index;
  previousCloud.disabled = index === 0;
  nextCloud.disabled = index === clouds.length - 1;
  const numbers = new Intl.NumberFormat(root.lang === 'en' ? 'en' : 'ar-SA');
  cloudCount.textContent = numbers.format(index + 1) + ' / ' + numbers.format(clouds.length);

  if (direction && !cloudMotion.matches) {
    outgoing.animate([
      { visibility: 'visible', opacity: 1, transform: 'translate3d(0, 0, 0) rotateY(0)' },
      { visibility: 'visible', opacity: 0, transform: 'translate3d(' + direction * -85 + 'px, 0, -240px) rotateY(' + direction * -24 + 'deg)' }
    ], { duration: 350, easing: 'ease-in' });
    clouds[index].animate([
      { opacity: 0, transform: 'translate3d(' + direction * 65 + 'px, 0, -160px) rotateY(' + direction * 25 + 'deg)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0) rotateY(0)' }
    ], { duration: 420, easing: 'ease-out' });
  }
}

previousCloud.addEventListener('click', () => showCloud(cloudIndex - 1, -1));
nextCloud.addEventListener('click', () => showCloud(cloudIndex + 1, 1));
cloudStage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  swipeStart = { x: event.clientX, y: event.clientY };
  cloudStage.setPointerCapture(event.pointerId);
});
cloudStage.addEventListener('pointercancel', () => { swipeStart = undefined; });
cloudStage.addEventListener('pointerup', event => {
  if (!event.isPrimary || !swipeStart) return;
  const distance = event.clientX - swipeStart.x;
  const vertical = event.clientY - swipeStart.y;
  swipeStart = undefined;
  if (Math.abs(distance) < 45 || Math.abs(distance) <= Math.abs(vertical)) return;
  const direction = distance < 0 ? 1 : -1;
  showCloud(cloudIndex + direction, direction);
});

cloudStage.classList.add('is-ready');
showCloud(0);
cloudControls.hidden = false;

const logoGrid = document.querySelector('.logo-grid');
const logoSlides = [...logoGrid.querySelectorAll('.logo')];
const logoControls = document.querySelector('.logo-controls');
const logoDots = logoControls.querySelector('.logo-dots');
let logoIndex = 0;

const logoIndicators = logoSlides.map((slide, index) => {
  const indicator = document.createElement('button');
  indicator.type = 'button';
  indicator.setAttribute('aria-label', slide.querySelector('h3').textContent);
  indicator.addEventListener('click', () => showLogo(index, Math.sign(index - logoIndex)));
  logoDots.append(indicator);
  return indicator;
});

function showLogo(index, direction = 0) {
  const outgoing = logoSlides[logoIndex];
  logoIndex = (index + logoSlides.length) % logoSlides.length;
  const incoming = logoSlides[logoIndex];

  logoSlides.forEach((slide, position) => {
    slide.getAnimations().forEach(animation => animation.cancel());
    slide.hidden = position !== logoIndex;
    slide.inert = slide.hidden;
    logoIndicators[position].setAttribute('aria-current', String(!slide.hidden));
  });

  if (outgoing === incoming || cloudMotion.matches || !direction) return;

  outgoing.hidden = false;
  const exit = outgoing.animate([
    { opacity: 1, transform: 'translateX(0) rotateY(0)' },
    { opacity: 0, transform: `translateX(${-direction * 32}%) rotateY(${-direction * 35}deg) scale(.84)` }
  ], { duration: 320, easing: 'ease-in', fill: 'forwards' });
  exit.onfinish = () => {
    outgoing.hidden = true;
    exit.cancel();
  };

  incoming.animate([
    { opacity: 0, transform: `translateX(${direction * 32}%) rotateY(${direction * 35}deg) scale(.84)` },
    { opacity: 1, transform: 'translateX(0) rotateY(0) scale(1)' }
  ], { duration: 520, easing: 'cubic-bezier(.2,.75,.25,1)' });
}

logoControls.querySelector('.logo-prev').addEventListener('click', () => showLogo(logoIndex - 1, -1));
logoControls.querySelector('.logo-next').addEventListener('click', () => showLogo(logoIndex + 1, 1));
logoGrid.classList.add('is-carousel');
showLogo(0);
logoControls.hidden = false;

// Keep the original Arabic markup so either language can be restored exactly.
const englishContent = [
  ['.brand', ['Shaimaa<span>✳</span>']],
  ['nav a', ['About me', 'My work', 'Courses', 'Contact']],
  ['[data-theme-choice]', ['☀ Day', '☾ Night']],
  ['.hero-copy .eyebrow', ['Welcome to my creative space']],
  ['.hero h1', ['Shaimaa Ameen<br><span>Al-Jaouri</span><i aria-hidden="true">✳</i>']],
  ['.role', ['Digital marketing <b>·</b> Graphic design']],
  ['.intro', ['I bring marketing ideas and design together to create a visual presence that expresses each brand.']],
  ['.actions a', ['Explore my work <span>↘</span>', 'Download CV PDF ↓']],
  ['#print', ['Print résumé']],
  ['.hero-note span', ['Years of experience<br>in digital marketing']],
  ['.sticker', ['Ideas start here.']],
  ['.portrait-bottom', ['Design that tells a story <span>01 / ABOUT ME</span>']],
  ['.ribbon span', ['Graphic design', 'Digital marketing', 'Visual identities', 'Video editing']],
  ['#about .eyebrow', ['01 / ABOUT & EXPERIENCE']],
  ['#about h2', ['Clear ideas.<br><span>A distinctive presence.</span>']],
  ['.about-cloud h3', ['About me', 'Experience & skills', 'Achievements']],
  ['.about-cloud p', [
    'I am <strong>Shaimaa Al-Jaouri</strong>, a 23-year-old designer. My journey began with a passion for the visual details around us, from product packaging to brand identities. Over time, that passion became a career dedicated to turning ideas into distinctive creative experiences.',
    'I have more than <strong>4 years of experience in digital marketing and creative design</strong>. My work includes front-end and back-end web development, visual identities and logos, packaging design, fashion and apparel design, graphic design, and advertising video production and editing.',
    'I combine creativity and technical skills to deliver integrated solutions that strengthen brands.',
    'Throughout my career, I have worked with <strong>more than 10 online stores</strong> that remain active today, helping develop their visual and digital presence.',
    'I have also completed <strong>more than 50 websites</strong>, combining engaging design and development with a focus on user experience and each project’s visual identity.'
  ]],
  ['#works .eyebrow', ['02 / SELECTED WORK']],
  ['#works h2', ['Ideas brought <span>to life.</span>']],
  ['.section-heading > p', ['Logos, products and digital experiences.']],
  ['.category', ['<span>01</span> Web design', '<span>02</span> Logo design', '<span>03</span> Product & advertising design']],
  ['.site-info h3', ['Luxury Perfume Store', 'Lujja Store', 'Perfume Factory Website']],
  ['.site-info p', [
    'I designed the Luxury store with a visual identity that reflects the brand and highlights its perfume, incense and musk collections. The interface organizes products and gift sets so visitors can easily explore the range and find what suits them.',
    'I designed Lujja, a Saudi store specializing in prayer beads and men’s vests, combining Saudi heritage with a clean, contemporary style. The interface highlights product details and makes collections easy to browse.',
    'I designed a corporate website for a perfume factory to present its manufacturing, filling and packaging services. The services are organized to help customers explore available options, request quotes and contact the factory directly.'
  ]],
  ['.site-info a', ['Visit website ↗', 'Visit website ↗', 'Visit website ↗']],
  ['.logo h3', ['Lujja', 'Lulu Al-Jazira Industrial Company', 'Jood', 'Luxury Perfume', 'Adaj', 'Lora | LORA']],
  ['.logo figcaption p', [
    'Lujja brings together Bakelite prayer beads and menswear with an authentic, elegant identity. The logo features extended Arabic lettering and a sequence of dots that evoke prayer beads, complemented by a decorative emblem.',
    'Lulu Al-Jazira is a cosmetics manufacturer with a visual identity that conveys precision and trust. Its interlocking geometric logo in gold and deep green gives the company a distinctive corporate presence.',
    'Jood is a kitchenware brand inspired by the warmth of home and generous hospitality. Its flowing Arabic lettering incorporates a home and tableware symbols, connecting the brand to everyday kitchen life.',
    'Luxury is a perfume brand with an identity that expresses elegance and refinement. Prominent English lettering balances the brand name with the word PERFUME, creating a clear, sophisticated presence on bottles and packaging.',
    'Adaj is a kohl and kohl-container brand inspired by the beauty and depth of Arab eyes. Bold Arabic lettering is paired with a symbol inspired by a traditional kohl container, while gold and burgundy lend the identity a luxurious heritage feel.',
    'Lora is a haircare brand for girls and women, with a soft identity inspired by beauty and femininity. Flowing lettering incorporates a rose into the name, giving the brand a gentle, distinctive character.'
  ]],
  ['.product h3', ['Lady Perfumes', 'A Gift from Lady', 'Perfume Box', 'Lora Haircare Set', 'Lora Hair Treatment', 'Lujja Prayer Beads']],
  ['.product figcaption p', [
    'Product presentation in an advertising scene',
    'Advertising design for a perfume gift box',
    'Highlighting packaging and product details',
    'Packaging design and a spa-inspired product presentation',
    'Haircare product presentation design',
    'Advertising design for products and packaging'
  ]],
  ['#courses .eyebrow', ['03 / LEARNING & DEVELOPMENT']],
  ['#courses h2', ['Courses <span>I have taken</span>']],
  ['#contact .eyebrow', ['04 / GET IN TOUCH']],
  ['#contact h2', ['Have an idea?<br>Let’s <span>design it.</span>']],
  ['#contact .button', ['Contact me on WhatsApp ↗']],
  ['footer span', ['Shaimaa Ameen Al-Jaouri', 'Marketing · Design · Creativity']],
  ['.print-resume h1', ['Shaimaa Ameen Al-Jaouri']],
  ['.print-resume h2', ['Profile & experience', 'Skills', 'Courses', 'Contact', 'Selected work']],
  ['.print-resume p:not([dir])', [
    'Digital marketing and graphic design',
    'Four years of digital marketing experience, with skills in logo design, product visuals, website visual identities and video editing.',
    'Digital marketing • Graphic design • Logo design • Product visuals • Visual identities • Video editing • Web design',
    'English language course'
  ]]
];

const localizedElements = englishContent.flatMap(([selector, translations]) =>
  [...document.querySelectorAll(selector)].map((element, index) => ({
    element, arabic: element.innerHTML, english: translations[index]
  }))
);
const courseTranslations = {
  'تطوير الويب': 'Web development',
  'البرمجة': 'Programming',
  'التصميم الجرافيكي': 'Graphic design',
  'الموشن جرافيك': 'Motion graphics',
  'مونتاج الفيديو': 'Video editing',
  'اللغة الإنجليزية': 'English',
  'اللغات': 'Languages'
};
document.querySelectorAll('.course-card h3, .course-card p').forEach(element => {
  const english = courseTranslations[element.textContent.trim()];
  if (english) localizedElements.push({ element, arabic: element.innerHTML, english });
});

const attributeTranslations = {
  'القائمة الرئيسية': 'Main navigation',
  'مظهر الموقع': 'Website appearance',
  'نبذة عن شيماء': 'About Shaimaa',
  'معرض الشعارات': 'Logo gallery',
  'الغيمة السابقة': 'Previous profile slide',
  'الغيمة التالية': 'Next profile slide',
  'الشعار السابق': 'Previous logo',
  'الشعار التالي': 'Next logo',
  'اختيار الشعار': 'Choose a logo',
  'الدورات والكورسات': 'Courses',
  'إغلاق المعاينة': 'Close preview'
};
const localizedAttributes = [...document.querySelectorAll('[aria-label]')]
  .filter(element => attributeTranslations[element.getAttribute('aria-label')])
  .map(element => ({ element, arabic: element.getAttribute('aria-label'), english: attributeTranslations[element.getAttribute('aria-label')] }));
const portrait = document.querySelector('.portrait');
const arabicPortraitAlt = portrait.alt;
const imageLabels = [...document.querySelectorAll('.site-card .store-banner')].map((element, index) => ({
  element, arabic: element.alt, english: [
    'Luxury perfume, incense and musk gift sets',
    'Blue Lujja prayer beads with a gift box',
    'A truck leaving a perfume factory at sunset'
  ][index]
}));
const workLabels = [...document.querySelectorAll('.work')].map(figure => {
  const button = figure.querySelector('[data-image]');
  const image = button.querySelector('img');
  return { figure, button, image, title: button.dataset.title, label: button.getAttribute('aria-label'), alt: image.alt };
});
const languageToggle = document.getElementById('language-toggle');
const arabicTitle = document.title;
const descriptionMeta = document.querySelector('meta[name="description"]');
const arabicDescription = descriptionMeta.content;

function setLanguage(language) {
  const english = language === 'en';
  root.lang = english ? 'en' : 'ar';
  root.dir = english ? 'ltr' : 'rtl';
  localizedElements.forEach(item => {
    item.element.innerHTML = english ? item.english : item.arabic;
  });
  localizedAttributes.forEach(item => item.element.setAttribute('aria-label', english ? item.english : item.arabic));
  imageLabels.forEach(item => { item.element.alt = english ? item.english : item.arabic; });
  workLabels.forEach(item => {
    const title = item.figure.querySelector('h3').textContent;
    item.button.dataset.title = english ? title : item.title;
    item.button.setAttribute('aria-label', english ? 'Enlarge ' + title : item.label);
    item.image.alt = english ? title + ' — ' + item.figure.querySelector('p').textContent : item.alt;
  });
  logoIndicators.forEach((indicator, index) => indicator.setAttribute('aria-label', logoSlides[index].querySelector('h3').textContent));
  portrait.alt = english ? 'Illustration of a girl with black hair wearing a blue dress and holding a rose behind her back' : arabicPortraitAlt;
  document.title = english ? 'Shaimaa Ameen Al-Jaouri | Portfolio' : arabicTitle;
  descriptionMeta.content = english ? 'Shaimaa Ameen Al-Jaouri’s portfolio — digital marketing, graphic design and web design.' : arabicDescription;
  languageToggle.textContent = english ? 'العربية' : 'English';
  languageToggle.lang = english ? 'ar' : 'en';
  languageToggle.setAttribute('aria-label', english ? 'التبديل إلى العربية' : 'Switch to English');
  const numbers = new Intl.NumberFormat(english ? 'en' : 'ar-SA');
  cloudCount.textContent = numbers.format(cloudIndex + 1) + ' / ' + numbers.format(clouds.length);
  if (lightbox.open) {
    const active = workLabels.find(item => item.button.dataset.image === previewImage.getAttribute('src'));
    if (active) {
      previewImage.alt = active.button.dataset.title;
      lightbox.querySelector('p').textContent = active.button.dataset.title;
    }
  }
  try { localStorage.setItem('shaimaa-language', root.lang); } catch (_) { }
}
languageToggle.addEventListener('click', () => setLanguage(root.lang === 'ar' ? 'en' : 'ar'));
let savedLanguage;
try { savedLanguage = localStorage.getItem('shaimaa-language'); } catch (_) { }
setLanguage(savedLanguage === 'en' ? 'en' : 'ar');
