ld        de,$400f
ld        bc,$0007
ld        h,$00
ld        l,$01
rst       $08
ld        l,$0f
rst       $08
ret

ld        c,b
ld        h,l
ld        l,h
ld        l,h
ld        l,a
ld        hl,$000a