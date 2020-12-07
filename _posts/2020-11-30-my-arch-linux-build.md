---
layout: post
title:  "My Arch Linux Build"
author: "Teran"
---

My first dive into Linux was when I was 14 or 15. I had been trolling through a bunch of hacking tutorials and forums for a few years and kept hearing about BackTrack Linux. The OG hacking distro (precursor to Kali). Back then, all I knew about Linux was that it was some alternative to Windows that hackers used. It fascinated me. I read and watched everything I could find about it. I couldn't believe the number of hacking tools it came with! I eventually decided to give it a go. Following their wiki, I was able to create a persistent, live USB that I could boot up to on my computer. I immediately ran a brunch of programs and turned into the worlds wimpiest script kitty. I eventually managed to man-in-the-middle my dad's computer and crack the WiFi password (that I already knew). 

Several dual boots later, a misaligned MBR that I had to repair, countless broken Linux installs, and an insane number of live USBs, and I was comfortably running BackTrack along side Windows on by crappy high school Acer NetBook. Just like the pro hackers! I quickly lost interest in the hacking tools, drawn instead to the world of Linux. I became a distro hopping fiend, trying every flavor of Linux I could get my hands on. I learned how to use VirtualBox to save myself the hundreds of minute long reboots and quickly became familiar with much of the Linux jargon. 

And then it happened. 11th grade rolled around and I was issued a school MacBook. The Acer was handed down to my sister and I was left, stuck between the confines of school bureaucracy and Apple restrictions. It wasn't until the end of my senior year (when I no longer cared if my computer broke), that I took the weeks long plunge into dual booting Linux on my MacBook. I dug through countless tutorials trying to get the install to work on my computer. I discovered rEFIt (now rEFInd), 

It is time. Time for me to really give arch a go. 

Doing this with EFI boot in Virtual Box (Virtual Box settings)

# Goals

BTRFS, ARCH, i3, ZSH, ENCRYPTED

512MB EFI
4GB Swap
500GB Root

# Pre-Instalation

### Internet

`ip link`
`iwctl`
I didn't have to touch this in VBOX
`ping archlinux.org`

### Disks

`fdisk -l`
/dev/sda
Ignoring /dev/loop0

`fdisk /dev/sda`
`g`

`n``default number``default first sector``+550M`
`n``default number``default first sector``+4G`
`n``default number``default first sector``default last sector`

`t``1``1` for EFI
`t``2``19` for Swap

`p` to check
`w` to write

`mkfs.fat -F32 -n EFI /dev/sda1`

`modinfo dm_crypt`

`cryptsetup benchmark`

`cryptsetup --type luks1 --align-payload=8192 -s 256 -c aes-xts-plain64 luksFormat /dev/sda3`

`cryptsetup open /dev/sda3 cryptarch`

`cryptsetup open --type plain --key-file /dev/urandom /dev/sda2 cryptswap`

`mkswap -L swap /dev/mapper/cryptswap`

`swapon -L swap`

`mkfs.btrfs --force -L arch /dev/mapper/cryptarch`

`mount -t btrfs /dev/mapper/cryptarch /mnt`
`btrfs subvolume create /mnt/root`
`btrfs subvolume create /mnt/home`
`btrfs subvolume create /mnt/snapshots`
`umount -R /mnt`

`o=defaults,x-mount.mkdir`
`o_btrfs=$o,compress=lzo,ssd,noatime`

`mount -t btrfs -o subvol=root,$o_btrfs /dev/mapper/cryptarch /mnt`
`mkdir /mnt/home`
`mkdir /mnt/.snapshots`
`mount -t btrfs -o subvol=home,$o_btrfs /dev/mapper/cryptarch /mnt/home`
`mount -t btrfs -o subvol=snapshots,$o_btrfs /dev/mapper/cryptarch /mnt/.snapshots`

`mkdir /mnt/boot`
`mount /dev/sda1 /mnt/boot`

# Install Arch
`pacstrap /mnt base btrfs-progs linux linux-firmware intel-ucode grub vim efibootmgr net-tools iproute2 iw dialog dhcpcd`
`genfstab -L -p /mnt >> /mnt/etc/fstab`
`cat /mnt/etc/fstab`

Check `vim /mnt/etc/fstab`


`arch-chroot /mnt`

`ln -sf /usr/share/zoneinfo/America/Denver /etc/localtime`
`hwclock --systohc`

`vim /etc/locale.gen`
Uncomment `en_US.UTF-8`
`locale-gen`
`echo LANG=en_US.utf8 >> /etc/locale.conf`
`echo LANGUAGE=en_US >> /etc/locale.conf`

`echo KEYMAP=es >> /etc/vconsole.conf`

`echo arch >> /etc/hostname`
`echo "127.0.1.1    arch.localdomain    arch" >> /etc/hosts`

`passwd`

`vim /etc/mkinitcpio.conf`
Add `encrypt` and `btrfs` to HOOKS
`mkinitcpio -p linux`

`vim /etc/crypttab`
Add `swap   /dev/sda2       /dev/urandom        swap,offset=2048,cipher=aes-xts-plain64,size=256`

Edit `/etc/default/grub`, add `GRUB_ENABLE_CRYPTODISK=y` and `GRUB_DISABLE_SUBMENU=y`
`GRUB_CMDLINE_LINUX="cryptdevice=/dev/sda3:cryptarch:allow-discards"`
`grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB`
`grub-mkconfig -o /boot/grub/grub.cfg`

`exit`
`umount -R /mnt`
`reboot`

`findmnt -nt btrfs`
`btrfs subvolume snapshot / /.snapshots/2020-12-03`
`ls .snapshots`
`btrfs subvolume list /`

`lsblk`
Done!
Time to configure...