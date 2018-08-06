https://help.github.com/articles/removing-sensitive-data-from-a-repository/


sox
- https://sourceforge.net/p/sox/mailman/message/34108419/
- https://sourceforge.net/p/sox/bugs/230/
- https://github.com/gillesdemey/node-record-lpcm16/issues/8#issuecomment-332175548
- https://github.com/googleapis/nodejs-speech/issues/13
- https://github.com/gillesdemey/node-record-lpcm16/issues/8
- https://sound.stackexchange.com/questions/32980/wav-file-recorded-with-wrong-header
- https://stackoverflow.com/questions/4497419/how-do-i-get-an-audio-file-sample-rate-using-sox
- https://forum.pjrc.com/threads/28246-how-to-play-raw-audio-file-in-PC
- https://unix.stackexchange.com/questions/403249/sox-convert-raw-audio-to-wav-gives-error-although-all-option-are-defined
- https://github.com/MexXxo/node-microphone/issues/1

https://github.com/MexXxo/node-microphone/blob/master/index.js

https://www.onlinehexeditor.com/
https://freehexeditorneo.com/
- C:\Users\JiboAdmin\AppData\Local\HHD Software\Hex Editor Neo\

https://nodejs.org/api/child_process.html

windows sox
- use the latest version
 - C:\Program Files (x86)\sox-14-4-2
- default device
 - `-d` doesn't work
 - use `-t waveaudio default`

record
sox -c 1 -b 16 -r 16000 -e signed-integer -t waveaudio default winwav.wav

sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default -p > test.wav

sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default temp.wav trim 0 3

pipe
sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default -t wav - | python -msave_stdin output_file.wav
sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default -t wav - | node ./node-write-stdin.js

- https://stackoverflow.com/questions/34500132/bash-or-python-script-to-read-binary-data-from-stdin-and-save-to-a-file
- https://github.com/mbostock/rw
- https://www.npmjs.com/package/ez-streams
- https://www.npmjs.com/package/binary-parser
- https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93

play
sox winwav.wav -t waveaudio default

play raw
sox -b 16 -c 1 -r 16000 -e signed-integer buffer.raw -t waveaudio default

sox -t raw -r 16000 -b 16 -c 1 -L -e signed-integer buffer.raw out.wav

synth
sox −r 8000 −n output.wav synth 3 sine 300−3300

sox −r 16000 −n -t wav - synth 3 sine 300−3300
