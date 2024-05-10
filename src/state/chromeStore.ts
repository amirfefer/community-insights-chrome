import { createStore } from 'jotai';
import { activeModuleAtom } from './atoms/activeModuleAtom';
import { contextSwitcherOpenAtom } from './atoms/contextSwitcher';
import { isPreviewAtom } from './atoms/releaseAtom';
import { isBeta } from '../utils/common';

const chromeStore = createStore();

// setup initial chrome store state
chromeStore.set(contextSwitcherOpenAtom, false);
chromeStore.set(activeModuleAtom, undefined);
chromeStore.set(isPreviewAtom, isBeta());

// globally handle subscription to activeModuleAtom
chromeStore.sub(activeModuleAtom, () => {
  // console.log('activeModule in store', chromeStore.get(activeModuleAtom));
});

export default chromeStore;
