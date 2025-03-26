# TODO List

## Security Enhancements
- [ ] Move SSH from port 22 to custom port (2222)
  - Edit `/etc/ssh/sshd_config`
  - Update `Port 22` to `Port 2222`
  - Additional hardening steps:
    - Disable root login
    - Use key-based authentication only
    - Limit login attempts
    - Configure fail2ban
  - Update firewall rules
  - Test connection before closing existing session

## Hardware Features
- [ ] Add Dashboard on GPIO Screen
  - Features to display:
    - System status (CPU, Memory, Disk usage)
    - Current backup status
    - Network status
    - Last successful backup time
    - Total storage used/available
  - Implementation options:
    - Use Python's `pygame` for display
    - Consider `luma.oled` for OLED displays
    - Implement auto-rotation of stats
    - Add basic touch/button navigation if available

## Nice to Have
- [ ] Add system monitoring and alerts
- [ ] Implement automatic backup pruning
- [ ] Add backup verification system 