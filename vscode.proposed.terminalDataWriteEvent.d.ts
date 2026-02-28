/*---------------------------------------------------------------------------------------------
 *  Proposed API: terminalDataWriteEvent
 *  https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.proposed.terminalDataWriteEvent.d.ts
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {
    export interface TerminalDataWriteEvent {
        /**
         * The terminal that the data was written to.
         */
        readonly terminal: Terminal;
        /**
         * The data being written to the terminal.
         */
        readonly data: string;
    }

    export namespace window {
        /**
         * An event that is emitted when data is written to a terminal.
         * This includes all data written via the terminal's pty process.
         */
        export const onDidWriteTerminalData: Event<TerminalDataWriteEvent>;
    }
}
