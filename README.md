# fall-source-chronicle

This is the [chronicle.vim](https://github.com/yukimemi/chronicle.vim) source of [fall.vim](https://github.com/vim-fall/fall.vim)

## Requirement

- [yukimemi/chronicle.vim: Denops Chronicle](https://github.com/yukimemi/chronicle.vim)
- [vim-fall/fall.vim: 🍂 Yet Another Fuzzy Finder designed for Vim and Neovim and implemented in Denops](https://github.com/vim-fall/fall.vim)

## Sample configuration

- FallCustom

```typescript
import type { Entrypoint } from "jsr:@vim-fall/custom";
import {
  composeRenderers,
  defineSource,
  refineCurator,
  refineSource,
  Source,
} from "jsr:@vim-fall/std";
import * as vars from "jsr:@denops/std/variable";
import * as builtin from "jsr:@vim-fall/std/builtin";
import { chronicle } from "jsr:@yukimemi/fall-source-chronicle";

const myPathActions = {
  ...builtin.action.defaultOpenActions,
  ...builtin.action.defaultSystemopenActions,
  ...builtin.action.defaultCdActions,
};
const myMiscActions = {
  ...builtin.action.defaultEchoActions,
  ...builtin.action.defaultYankActions,
  ...builtin.action.defaultSubmatchActions,
};

export const main: Entrypoint = (
  {
    definePickerFromSource,
    refineSetting,
  },
) => {
  refineSetting({
    coordinator: builtin.coordinator.modern,
    theme: builtin.theme.MODERN_THEME,
  });

  const defineChroniclePicker = (mode: "read" | "write") => {
    definePickerFromSource(
      `chronicle:${mode}`,
      refineSource(
        chronicle({ mode }),
        builtin.refiner.exists,
        builtin.refiner.relativePath,
      ),
      {
        matchers: [builtin.matcher.fzf],
        sorters: [builtin.sorter.noop],
        renderers: [
          composeRenderers(builtin.renderer.smartPath, builtin.renderer.nerdfont),
          builtin.renderer.noop,
        ],
        previewers: [builtin.previewer.file],
        actions: { ...myPathActions, ...myMiscActions },
        defaultAction: "open",
      },
    );
  };

  defineChroniclePicker("read");
  defineChroniclePicker("write");
};
```

## License 

Licensed under MIT License.

Copyright (c) 2024 yukimemi

