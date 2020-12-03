---
layout: post
title:  "My Arch Linux Build"
author: "Teran"
---

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
`pacstrap /mnt base btrfs-progs linux linux-firmware intel-ucode grub vim efibootmgr`
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