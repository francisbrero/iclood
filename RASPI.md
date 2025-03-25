# Instructions for setting up a Raspberry Pi

## Prerequisites

We assume you have a Raspberry Pi running with the latest version of Raspberry Pi OS.

## Networking

### Assign a static IP address

Connect to your router and set up a static IP address.

### Forward ports

Add new port forwarding rules to your router to forward ports 8080 and 22 to the Raspberry Pi.

### Test connection

Connect to the Raspberry Pi using SSH.

```bash
ssh pi@<Raspberry Pi IP address>
```

If you can connect, you're good to go.

## Using the Pi as a web gallery

Check out pigallery2 [here](https://github.com/bpatrik/pigallery2).