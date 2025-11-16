Output demo.gif

# Terminal styling
Set WindowBarSize 50
Set WindowBar Colorful
Set Framerate 60
Set FontSize 22
Set Padding 20
Set Width 1300
Set Height 820
Set Theme "Dracula"

# Start the demo
Type@80ms "bun examples/index.ts"
Enter
Sleep 1s

# First simple input (name)
Sleep 500ms
Type@90ms "Pras Samin"
Sleep 400ms
Enter
Sleep 900ms

# Main multiline prompt
Sleep 400ms
Type@80ms "This is a demo of the next-gen multiline CLI prompt!"
Sleep 700ms

# Insert new line via Shift+Enter / Alt+Enter showcase
Alt+Enter
Sleep 250ms
Type@80ms "It supports smooth, clean"
Sleep 400ms

# Show cursor navigation + editing
Backspace 5
Sleep 200ms
Type@80ms "awesome features."
Sleep 700ms

# Word deletion
Escape
Backspace
Sleep 250ms
Type@80ms "features!"
Sleep 800ms

# Submit the final multiline result
Enter
Sleep 2.5s
