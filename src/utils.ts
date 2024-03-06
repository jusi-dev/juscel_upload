import {spawn} from 'child_process';
import path from 'path';

const MAX_LEN = 8;

export function generate() {
    let ans = "";
    const subset = "123456789abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < MAX_LEN; i++) {
        ans += subset[Math.floor(Math.random() * subset.length)];
    }
    return ans;
}

export function removeOutputs(id: string) {
    return new Promise((resolve) => {
        const child = spawn('rm', ['-rf', path.join(__dirname, `output/${id}`)])

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        })
        child.on('close', function(code) {
            resolve("");
        })
    })
}
