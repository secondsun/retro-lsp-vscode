/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as Path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
    ServerOptions,
    RevealOutputChannelOn,
    TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	console.log('Activating snesasm');

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        documentSelector: ['snesasm'],
        synchronize: {
            configurationSection: 'snesasm',
            fileEvents: [
                workspace.createFileSystemWatcher('**/*.s'),
                workspace.createFileSystemWatcher('**/*.sgs'),
                workspace.createFileSystemWatcher('**/*.s700')
            ]
        },
        outputChannelName: 'snesref',
        revealOutputChannelOn: RevealOutputChannelOn.Info // never
    }

    let launcherRelativePath = platformSpecificLauncher();
    let launcherPath = [context.extensionPath].concat(launcherRelativePath);
    let launcher = Path.resolve(...launcherPath);
    
    console.log(launcher);
    
    // Start the child java process
    let serverOptions: ServerOptions = {
            run : { command: launcher, transport: TransportKind.stdio,
                    options: { cwd: context.extensionPath }
            },
            debug : { command: launcher, transport: TransportKind.stdio,
                options: { cwd: context.extensionPath }
        }
    }
    


    // Create the language client and start the client.
    let client = new LanguageClient('snesasm', 'snesasm reference Language Server', serverOptions, clientOptions);
    try {
        let disposable = client.start();
        // Push the disposable to the context's subscriptions so that the 
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    } catch (error) {
        console.log(error)
    }

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
function platformSpecificLauncher(): string[] {
	switch (process.platform) {
		case 'win32':
            return ['dist', 'windows', 'bin', 'launcher.bat'];

		case 'darwin':
			return ['dist', 'mac', 'bin', 'launcher'];

		case 'linux':
            return ['dist', 'linux', 'bin', 'launcher'];			
	}

	throw `unsupported platform: ${process.platform}`;
}
