<script setup lang="ts">
import { computed, ref } from 'vue'

type Shot = { id: number; title: string; prompt: string; start: number; length: number; tone: string }
const idea = ref('Человек просыпается в живом мегаполисе, где каждое окно наблюдает за ним.')
const music = ref('medals_test.wav')
const generating = ref(false)
const projectReady = ref(true)
const activeTab = ref<'timeline' | 'script'>('timeline')
const selected = ref(1)
const playhead = ref(22)
const toast = ref('')
const shots = ref<Shot[]>([
  { id: 1, title: '01 · ПРОБУЖДЕНИЕ', prompt: 'Wide — bedroom swallowed by neon dawn', start: 0, length: 28, tone: 'violet' },
  { id: 2, title: '02 · ГОРОД ДЫШИТ', prompt: 'Low angle — living street, blinking windows', start: 24, length: 31, tone: 'orange' },
  { id: 3, title: '03 · ОН ВИДИТ ТЕБЯ', prompt: 'Close up — reflections move independently', start: 52, length: 25, tone: 'cyan' },
])
const selectedShot = computed(() => shots.value.find(s => s.id === selected.value) ?? shots.value[0])
function flash(message: string) { toast.value = message; window.setTimeout(() => toast.value = '', 2500) }
function generate() {
  generating.value = true
  window.setTimeout(() => { generating.value = false; projectReady.value = true; flash('Клип собран: 3 motion-сегмента готовы') }, 1050)
}
function drop(event: DragEvent) {
  const id = Number(event.dataTransfer?.getData('shot'))
  const shot = shots.value.find(s => s.id === id)
  if (!shot) return
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  shot.start = Math.max(0, Math.min(82, Math.round((event.clientX - box.left) / box.width * 88)))
  flash('Сцена перемещена на таймлайне')
}
function exportProject() { flash('Проект Botan сохранён в projects/megapolis-awake') }
</script>

<template>
  <main>
    <header class="topbar">
      <a class="brand" href="#"><span class="seed">✦</span><span>BOTAN</span><small>COMIC CLIP FACTORY</small></a>
      <div class="crumb">PROJECTS <b>/</b> МЕГАПОЛИС ПРОСЫПАЕТСЯ <i>⌄</i></div>
      <div class="header-actions"><button class="icon">↶</button><button class="icon">↷</button><button class="export" @click="exportProject">Экспорт</button><button class="render" @click="generate">{{ generating ? 'СБОРКА...' : 'RENDER CLIP ↗' }}</button></div>
    </header>

    <section class="workspace">
      <aside class="sidebar">
        <div class="side-heading"><span>AI DIRECTOR</span><button>＋</button></div>
        <button class="new-project">＋ <span>Новый comic clip</span><small>⌘ K</small></button>
        <nav><button class="active">✦ <span>Магия</span><small>01</small></button><button>▦ <span>Storyboard</span></button><button>◒ <span>Character bible</span></button><button>◌ <span>Style memory</span></button></nav>
        <div class="side-heading library-label"><span>БИБЛИОТЕКА</span><button>⌕</button></div>
        <div class="asset"><div class="asset-icon violet">⌁</div><div><b>Night city bible</b><small>Style · 12 refs</small></div><em>•••</em></div>
        <div class="asset"><div class="asset-icon coral">◉</div><div><b>Михаил / protagonist</b><small>Character · locked</small></div><em>•••</em></div>
        <div class="asset"><div class="asset-icon green">♫</div><div><b>{{ music }}</b><small>Music · 02:18</small></div><em>•••</em></div>
        <div class="provider-card"><div><span class="live-dot"></span> VIDEO PROVIDER</div><b>SVI Infinity <small>v2.0</small></b><p>Keyframe → motion, с памятью продолжения сцены.</p><button>Настроить провайдер →</button></div>
      </aside>

      <section class="center">
        <section class="prompt-panel">
          <div class="eyebrow"><span>✦ MAGIC DIRECTOR</span><span>CONTINUITY ON</span></div>
          <textarea v-model="idea" aria-label="Идея клипа"></textarea>
          <div class="prompt-footer"><button class="chip" @click="music = music === 'medals_test.wav' ? 'new_track.wav' : 'medals_test.wav'">♫ {{ music }}</button><button class="chip">▧ 9:16</button><button class="magic" @click="generate"><span>✦</span> {{ generating ? 'БОТАН ДУМАЕТ...' : 'MAKE MY COMIC CLIP' }}</button></div>
        </section>
        <section class="viewer">
          <div class="viewer-head"><span>PREVIEW · <b>SCENE 02</b></span><span>1080 × 1920 <i>⋮</i></span></div>
          <div class="artboard">
            <div class="grain"></div><div class="moon"></div><div class="tower tower-a"></div><div class="tower tower-b"></div><div class="tower tower-c"></div><div class="windows"></div><div class="road"></div><div class="person"></div>
            <div class="frame-copy"><span>02 / 03</span><strong>ГОРОД<br>ДЫШИТ</strong><i></i><small>МЕГАПОЛИС · 04:17 AM</small></div>
            <div class="motion-pill"><span>✦</span><div><b>MOTION SEGMENT</b><small>SVI · 4.0 sec · ready</small></div></div>
            <div class="safe-area"></div><div class="timecode">00:00:08:12</div>
          </div>
          <div class="transport"><button @click="playhead = playhead > 80 ? 0 : playhead + 8">▶</button><button>◀</button><div class="scrubber" @click="playhead = 50"><i :style="{ width: playhead + '%' }"></i></div><button>▶</button><b>00:08 / 00:18</b><button class="sound">⌁</button></div>
        </section>

        <section class="timeline-panel">
          <div class="timeline-head"><div><button :class="{ on: activeTab === 'timeline' }" @click="activeTab = 'timeline'">TIMELINE</button><button :class="{ on: activeTab === 'script' }" @click="activeTab = 'script'">SCRIPT</button></div><div><span>24 FPS</span><button>⌘ SNAP</button><button>＋</button></div></div>
          <template v-if="activeTab === 'timeline'"><div class="ruler"><span v-for="n in 7" :key="n">00:0{{ n * 3 }}</span></div><div class="tracks" @dragover.prevent @drop="drop"><div class="track-label"><b>V1</b><small>KEYFRAMES</small></div><div class="track-lane"><div v-for="shot in shots" :key="shot.id" class="clip" :class="[shot.tone, { selected: selected === shot.id }]" :style="{ left: shot.start + '%', width: shot.length + '%' }" draggable="true" @dragstart="event => event.dataTransfer?.setData('shot', String(shot.id))" @click="selected = shot.id"><span>▣</span> {{ shot.title }}</div></div><div class="track-label"><b>✦</b><small>MOTION</small></div><div class="track-lane motion-track"><div v-for="shot in shots" :key="shot.id" class="motion-clip" :class="shot.tone" :style="{ left: shot.start + '%', width: shot.length + '%' }">SVI · {{ shot.length / 7 }}s</div></div><div class="track-label"><b>♫</b><small>AUDIO</small></div><div class="track-lane audio-track"><div class="audio-wave"></div><div class="audio-name">♫ MEDALS TEST · 124 BPM</div></div><div class="playline" :style="{ left: `calc(116px + ${playhead}%)` }"></div></div></template>
          <div v-else class="script-view"><b>SCENE 02 — ГОРОД ДЫШИТ</b><p>Улицы плавятся в мокром свете. Окна мигают, словно веки, и следят за героем.</p></div>
        </section>
      </section>

      <aside class="inspector">
        <div class="inspector-tabs"><button class="on">ИНСПЕКТОР</button><button>РАБОЧИЙ ПРОЦЕСС</button></div>
        <div class="section-title">ВЫБРАННАЯ СЦЕНА <b>•••</b></div>
        <div class="scene-card"><div class="scene-thumb"></div><div><b>{{ selectedShot.title }}</b><small>KEYFRAME + MOTION</small></div></div>
        <label>Prompt <textarea :value="selectedShot.prompt"></textarea></label>
        <label>Длительность <span>4.0 sec</span><input type="range" min="2" max="8" value="4" /></label>
        <label>Переход <select><option>Soft dissolve</option><option>Match cut</option><option>Hard cut</option></select></label>
        <div class="continuity"><span>✦ CONTINUITY ENGINE</span><p>Герой, свет и направление движения удерживаются между сценами.</p><button>Показать memory →</button></div>
        <div class="generation"><div><span class="live-dot"></span> GENERATION QUEUE</div><b>3 / 3 сегментов</b><small>Все keyframes готовы к рендеру</small><div class="progress"><i></i></div></div>
      </aside>
    </section>
    <div v-if="toast" class="toast">✓ {{ toast }}</div>
  </main>
</template>
