# Tesla App Clone

*Inspired by the Tesla mobile app experience.*


A React Native app that recreates the Tesla companion experience around a **live, interactive 3D Model 3** — tap to open its doors, frunk and trunk, watch spec-accurate climate airflow flow through the cabin, and control everything from a bottom sheet that stays in sync across every screen.

Built with Expo SDK 57, TypeScript, Three.js via React Native Fiber, and the React Native New Architecture.

> **Note / Disclaimer**
> I do **not** have access to the official Tesla app. Everything in this project — layouts, interactions, animations, and the airflow behavior — was recreated **from scratch, based only on videos and screenshots/pictures** I found online. Tesla is a trademark of Tesla, Inc.; this is a non-commercial, educational clone with no affiliation to or endorsement from Tesla.


### Try It Now!
<!-- TODO: EAS Preview APK link goes here -->

*APK coming soon — assets and store build in progress.*


## Video Demo



https://github.com/user-attachments/assets/4862ce35-2e33-41b5-8c3b-c64282c13d6e




## Screenshots

<table align="center">
  <tr>
    <td align="center">
      <img width="350" alt="image 1" src="https://github.com/user-attachments/assets/94ea228a-8de6-45e7-a61d-ce65898271ca" />
    </td>
    <td align="center">
      <img width="350" alt="image 2" src="https://github.com/user-attachments/assets/29ae31d4-828e-42e1-a83e-e41c076a97f8" />
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img width="350" alt="image 3" src="https://github.com/user-attachments/assets/46896d71-df7a-40bf-ab21-4369882598f3" />
    </td>
  </tr>
</table>

## Features


### Interactive 3D Vehicle
- **Real Model 3 geometry** — the factory GLB is auto-fitted to a fixed length so every camera framing is deterministic
- **Tap to operate** — raycast taps on the model open/close each door, the frunk, and the trunk (verified by a live `TESLA3DDEBUG tap` log)
- **Smooth mechanical animation** — door pivots, frunk and trunk lids swing with exponential damping tuned per mechanism
- **Live paint** — five body colors recolor every paint-tagged material in real time from the Driving screen
- **Four camera modes** — home perspective, top-down controls, top-down climate, and a driving view, all transitioned with frame-rate-independent easing


### Climate & Airflow (Spec-Accurate)
- **Full-screen climate** — temperature stepper, cooling/heating status pill, fan speed 1–10, defrost, and 5-zone seat heaters
- **Volumetric airflow mist** — dual rounded plumes that originate at the dash vent slot, run over the front seat cushions, and die out at the headrests, with a visible recess along the center console
- **Fixed mask, moving texture** — the plume silhouette is static while ripple strokes translate continuously from vent to rear at a speed driven by the fan setting
- **Spec opacity profile** — ramp 0–15%, dense translucency to 60%, smooth fade to 100% (applied via an SVG gradient mask)
- **Three airflow targets**:
  - *Home* — approved ambient cabin band
  - *Climate* — vent → headrest plumes over the seats
  - *Defrost* — plumes rotate to aim forward at the windshield
- **Heating & cooling palettes** — frosted `#EBF0FF` mist when cooling, crimson `#DC3228` when heating, driven by one shared state
- **Heated seats warm the car** — the seat leather gains an emissive warm glow scaled by the highest seat level, visible through the cabin glass
- **Defrost behaves like the real car** — turning it on forces the HVAC system on and redirects the airflow toward the windshield


### Controls
- **Bottom sheet** — collapsed shows 7 bare outline quick-action icons (frunk, trunk, lock, lights, horn, start, HomeLink); tap the handle to expand into state cards and the labeled strip
- **On-car anchored pills** — Open/Close chips and the lock icon are projected onto the actual frunk, trunk, and roof of the 3D model through the live camera, so they follow the car as it zooms
- **Nav-safe spacing** — sheet content respects gesture/button navigation insets on Android and the home indicator on iOS


### Home
- **Quick actions** — lock toggle, climate, controls
- **Fan icon spins** at a tempo derived from the current fan speed while climate is active
- **Media mini player** and a **navigation menu list** for mode switching


### Driving
- **Speed controls** — DRIVE / STOP presets plus ±15 MPH steppers with a live gauge
- **Paint picker** — five colors, applied instantly to the 3D body
- **Headlight toggle** and a subtle motion pitch while "driving"


### One Shared State
Every climate edit — power, target temperature, fan speed, defrost, seat heaters — lives in a single React context, so the home fan spin, the cabin mist, the status pills, and the full-screen controls always agree. The AC starts **on and in cooling** by default.


---


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) SDK 57 + React Native 0.86.3 (New Architecture) |
| Language | TypeScript 6.0 |
| 3D | [three](https://threejs.org) 0.186 + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) 9 + drei |
| State | React Context (`TeslaContext`) |
| Animation | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.5 + custom exponential damping |
| 2D Graphics | [react-native-svg](https://github.com/software-mansion/react-native-svg) 15.15 (airflow, masks, gradients) |
| Icons | [lucide-react-native](https://lucide.dev/) |
| Safe Area | [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) |
| Model Assets | expo-asset (GLB streaming/preload) |


---


## Project Structure

```
App.tsx                           # Root: SafeAreaProvider → TeslaProvider → MainScreen
src/
├── context/
│   └── TeslaContext.tsx          # Single source of truth: vehicle + climate state
├── types/
│   └── tesla.ts                  # TeslaState, context API, view modes
├── utils/
│   └── layout.ts                 # Shared layout constants (header, canvas, sheet)
│
└── components/
    ├── car/
    │   ├── Tesla3DCanvas.tsx         # WebGL canvas, camera rig, probes, overlays, on-car pills
    │   ├── Tesla3DCarModel.tsx       # GLB load + auto-fit, door/lid animation, paint,
    │   │                             #   seat glow, tap raycasting
    │   ├── CabinAnchorProbe.tsx      # Projects the cabin volume through the live camera
    │   ├── CabinAirflowOverlay.tsx   # Spec airflow SVG (home / climate / defrost variants)
    │   ├── CarAnchorProbe.tsx        # Projects frunk/trunk/lock anchors to screen px
    │   └── TeslaSvgCarCanvas.tsx     # 2D SVG fallback if WebGL is unavailable
    │
    └── controls/
        ├── Header.tsx                # Mode title + back navigation
        ├── BottomSheet.tsx           # Expandable sheet (collapsed ⇄ expanded)
        ├── ControlsDrawer.tsx        # Quick-action icons + vehicle action cards
        ├── ClimateDrawer.tsx         # Temp stepper, fan speed, defrost, seat heaters
        ├── QuickActionBar.tsx        # Home quick actions with spinning fan
        ├── MediaMiniPlayer.tsx       # Now-playing strip
        ├── NavigationMenuList.tsx    # Mode launcher list
        └── DrivingOverlay.tsx        # Speed, paint picker, headlights
```


---


## Getting Started

### Prerequisites

- Node.js 18+
- An Android device/emulator or iOS simulator
- [Expo Go](https://expo.dev/go) for quick testing, or an [Expo dev build](https://docs.expo.dev/develop/development-builds/introduction/)


### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.


### Exploring the App

1. **Home** — the car sits in perspective view; tap its doors/frunk/trunk directly on the model
2. Tap the **fan quick action** to open the full-screen Climate view (top-down camera)
3. Watch the **airflow mist** drift over both seats from the dash vent — adjust the fan and the ripples speed up
4. Toggle **Defrost** — the HVAC forces on and the plumes swing forward to the windshield
5. Set a **seat heater** — the interior leather warms up visibly through the glass
6. Open **Controls** — use the outline quick icons collapsed, or expand the sheet for cards


---


## Engineering Log

*Real problems hit while building this app, ranked by how hard they were to crack — and exactly how each one was solved.*


### Rank 1 (Extreme) — The Airflow Was Invisible: 3D Mist vs. an Opaque Car


#### The Problem
The cabin airflow was first built as 3D ribbons inside the car. From the home camera they were either completely hidden behind the bodywork, or they leaked out past the A-pillar like exhaust smoke. The user could not see the effect at all.


#### Root Cause
1. **Opaque geometry occludes the interior**: from any perspective camera, you see the cabin *through* the door skins, roof rails, and semi-transparent glass (`glass.0`/`glass.1` alpha-blend at 0.62–0.66). Anything drawn inside the cabin is depth-occluded by the body before the glass blends over it.
2. **Transparent-vs-transparent sorting**: mist and glass are both alpha-blended, so draw order becomes frame-dependent — flickering bands and leak-through at panel gaps.


#### How I Fixed It
1. **Moved the airflow out of the 3D scene entirely** — it became a 2D SVG overlay drawn *above* the canvas.
2. **Built `CabinAnchorProbe`** — a component that lives *inside* the R3F canvas, projects an 8-corner cabin volume through the **live camera** every 150ms, takes the convex hull, insets it 12%, and reports screen-space pixels to React.
3. The SVG mist is **clipped to that projected polygon**, so it always reads as "inside the cabin" and follows the car through every camera transition, zoom, and device rotation.


#### The Result
A stable, feathered mist that looks like it lives in the cabin from every angle — with zero z-fighting, zero flicker, and no shader cost on the GL thread.


---


### Rank 2 (Extreme) — Overshoot & Slow Motion: The Frame-Delta Lerp Trap


#### The Problem
Camera transitions overshot their target and oscillated before settling; the frunk and trunk lids either crawled or snapped depending on the device. On slower phones everything felt underwater; on fast frames it jittered around the endpoint.


#### Root Cause
The animation code was easing with `current = lerp(current, target, delta)` — passing the **raw frame delta** as the blend factor. Frame delta is a *duration*, not a *progress*:
- A long frame (100ms hitch) produced a step greater than the remaining distance in unstable configurations, causing overshoot and oscillation.
- A short frame (16ms) produced tiny steps, so the animation took far longer than intended — slow motion.


#### How I Fixed It
1. Replaced every raw-delta lerp with **exponential damping**:
   ```
   t = 1 − exp(−rate × delta)
   current = lerp(current, target, t)
   ```
   This is frame-rate independent, monotonically convergent, and mathematically **cannot overshoot**.
2. Tuned per-mechanism rates: camera **5**, lids/doors **12**, driving tilt **4**.
3. Removed clamps that were masking the symptom instead of the cause.


#### The Result
Identical, buttery motion on 60Hz and 120Hz devices alike — the camera glides exactly once, lids settle crisply, and nothing oscillates.


---


### Rank 3 (High) — Spec-Perfect Anchors: The "Dash" That Was Actually the B-Pillar


#### The Problem
The full-screen airflow was supposed to emerge from the dashboard vent slot behind the steering wheel and infotainment screen. It started near the middle of the cabin instead. Worse, the mist's densest region sat at its own midpoint, not at the vent.


#### Root Cause
1. **Hand-estimated world coordinates**: the `DASH` anchor at `z = -0.05` turned out to sit on the **B-pillar belt line** — roughly 0.4 world-units behind the real vent.
2. **Symmetric gradient**: each plume used a radial gradient centered on the ellipse, so peak opacity landed at 50% of the length instead of the spec's ramp-to-peak by 15%.


#### How I Fixed It
1. **Parsed the GLB offline** — a Node script read the GLB's JSON chunk directly, walked the node TRS hierarchy, transformed each accessor's min/max bbox through the parent chain, and applied the app's exact fit transform (`scale = 5.0 / size.z`, `lift = size.y / 2 · scale`).
2. This yielded exact post-fit world boxes: steering wheel `z[-0.75, -0.51]`, windscreen rear edge `z = -0.22`, seat tops to `y = 1.40` — real numbers instead of proportion guesses.
3. Re-anchored climate flow: **vent `(0, 1.02, -0.38)` → headrests `(0, 1.08, 0.42)`**, plumes centered over the seat cushions (`x ≈ ±0.44`) with a true console gap.
4. Applied the opacity profile properly: an SVG `<Mask>` with a white `0 / 0.15 / 0.6 / 1` gradient now multiplies the feathered plumes — ramp at the vent, dense over the seats, gone at the headrests.


#### The Result
Airflow that emerges exactly at the vent, hugs the correct anatomy of the car, and matches the written spec at every checkpoint along its length.


---


### Rank 4 (Medium) — Vanishing Quick Actions: A Flex Child Clipped to Negative Y


#### The Problem
The collapsed Controls sheet suddenly showed an empty strip — the seven quick-action icons were simply gone. Separately, sheet content sat underneath Android's gesture navigation bar.


#### Root Cause
1. **`flex: 1` inside a ScrollView content container**: the drawer was given `flex: 1` + `justifyContent: 'flex-end'` to bottom-pin it, but a flex child of an indeterminate-height content container can measure to **zero height**. With `flex-end`, the icon row was then positioned at **negative Y — above the scroll viewport's clip**.
2. **Android's `SafeAreaView` is a no-op**: RN's built-in only applies insets on iOS, so the absolutely-positioned sheet ran under the system nav bar on Android.


#### How I Fixed It
1. Removed the flex-child pinning; content is **top-aligned** (it physically cannot start above the viewport) with `contentContainerStyle: { flexGrow: 1 }` on the ScrollView.
2. Installed **react-native-safe-area-context** and wrapped the app in `SafeAreaProvider`; the sheet pads its bottom with `insets.bottom + 12` (Android) while iOS relies on the root `SafeAreaView` (no double-counting).
3. Centralized header/canvas/sheet geometry in `src/utils/layout.ts` so the sheet's collapsed top can never drift from the canvas height.


#### The Result
Quick actions are always visible with a guaranteed gap above the gesture bar, on any screen height, in both collapsed and expanded states.


---


## Architecture

### Probe → Overlay Pattern
Anything that must appear "on" or "inside" the 3D car — pills, airflow, clip regions — is resolved the same way: a probe component runs **inside** the R3F canvas, projects world-space anchors through the live camera, and hands plain pixel coordinates to ordinary React Native views. The 3D scene never has to composite 2D UI, and the overlays never need to know about WebGL.

### Single Authoritative State
`TeslaContext` owns the entire vehicle: locks, doors, frunk/trunk, climate (`climateActive`, `isHeating`, `targetTemp`, `fanSpeed`, `defrostActive`, seat heaters), speed, paint, lights. One edit propagates instantly to the home fan spin, the cabin mist, the status pills, and the full-screen controls. No screen holds private copies of shared state.

### GLB as Ground Truth
Rather than trusting memory or proportion estimates, model geometry questions are answered by **parsing the GLB directly** (JSON chunk + accessor bboxes + node transforms) and applying the same fit math the renderer uses. All airflow and pill anchors derive from measured coordinates.

### SVG Volumetrics, Not Shaders
The mist is pure `react-native-svg`: radial gradients for cylindrical falloff, a gradient mask for the axial opacity profile, dash-offset animation for the moving ripples. It runs on the UI thread, costs nothing on the GL thread, and renders identically on Expo Go — no custom shaders, no post-processing.


---


## Future Roadmap

- [x] Spec airflow for the full-screen climate view
- [x] Defrost redirect + HVAC coupling
- [x] Heated-seat glow on the 3D interior
- [x] Shared climate state across home and full screen
- [ ] **Screenshot & video demo assets**
- [ ] **EAS preview APK**
- [ ] Rear-window defrost visual
- [ ] Seat heater auto-timeout (as in the real car)
- [ ] Drag-to-expand gesture on the bottom sheet
- [ ] OTA-style battery/charging status card


---


## License

MIT
