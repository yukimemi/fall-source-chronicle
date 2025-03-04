// =============================================================================
// File        : chronicle.ts
// Author      : yukimemi
// Last Change : 2024/11/18 01:45:27.
// =============================================================================

import * as fn from "jsr:@denops/std@7.5.0/function";
import * as vars from "jsr:@denops/std@7.5.0/variable";
import { TextLineStream } from "jsr:@std/streams@1.0.9/text-line-stream";
import { defineSource, type Source } from "jsr:@vim-fall/std@0.11.0";

/**
 * Represents details about a chronicle entry.  Currently only contains the file path.
 */
export type Detail = {
  /**
   * Absolute path of the chronicle file entry.  This is also the value yielded by the stream.
   */
  path: string;
};

/**
 * Options for the Chronicle source.  Allows specifying read or write mode, and a file filtering function.
 */
export type ChronicleOptions = {
  /**
   * Specifies whether to read or write mode. Defaults is "read".
   */
  mode?: "read" | "write";

  /**
   * An optional function to filter file paths.  If the function returns `false`, the file path is skipped.  Defaults to a function that always returns `true`.
   */
  filterFile?: (path: string) => boolean;
};

/**
 * A source that reads or writes to a chronicle file.  The file path is determined by the `mode` option and
 * the `g:chronicle_read_path` or `g:chronicle_write_path` Vim variables, or an argument passed directly.
 * @param options - Options for the chronicle source.
 * @returns A source that yields chronicle entries.
 */
export function chronicle(options: Readonly<ChronicleOptions> = {}): Source<Detail> {
  const {
    mode,
    filterFile = () => true,
  } = options;
  return defineSource(async function* (denops, { args }, { signal }) {
    const filepath = mode == "write"
      ? await vars.g.get(denops, "chronicle_write_path")
      : mode == "read"
      ? await vars.g.get(denops, "chronicle_read_path")
      : args[0];
    const file = await Deno.open(
      await fn.fnamemodify(denops, filepath, ":p"),
    );
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());

    let id = 0;
    for await (const line of lineStream) {
      signal?.throwIfAborted();
      if (filterFile(line)) {
        yield {
          id: id++,
          value: line,
          detail: { path: line },
        };
      }
    }
  });
}
