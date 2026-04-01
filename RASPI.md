# Instructions for setting up a Raspberry Pi

## Prerequisites

We assume you have a Raspberry Pi running with the latest version of Raspberry Pi OS.
We also recommend having a GPIO connected screen.

## Networking

### Assign a static IP address

Connect to your router and set up a static IP address.

### Forward ports

Add new port forwarding rules to your router to forward ports 8080 and 22 to the Raspberry Pi.

```bash
sudo ufw allow 8080
sudo ufw allow 22
sudo ufw allow ANY_PORT_YOU_USE
sudo ufw reload
```

### Test connection

Connect to the Raspberry Pi using SSH.

```bash
ssh pi@<Raspberry Pi IP address>
```

If you can connect, you're good to go.

## Using the Pi as a web gallery

Check out pigallery2 [here](https://github.com/bpatrik/pigallery2).

## GPIO screen

