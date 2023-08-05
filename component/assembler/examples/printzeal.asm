; Copyright(c) 2023 Zeal 8-bit Computer <contact@zeal8bit.com>
; Easiest Z80 assembly example

ORG 0x4000
ld de, message
ld bc, 7
ld h, 0
ld l, 1
rst 8
ld l, 15
rst 8
ret
message: db "Hello!\n"