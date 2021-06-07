 #!/bin/bash
 sudo modprobe v4l2loopback-dc width=960 height=720 && droidcam &>/dev/null & disown