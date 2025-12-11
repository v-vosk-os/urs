
# If you have Pillow installed, run this script to generate PNG icons
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        # Create a new image with gradient background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw rounded rectangle with gradient (simplified)
        # For a real gradient, you'd need more sophisticated drawing
        color1 = (102, 126, 234)  # #667eea
        color2 = (118, 75, 162)   # #764ba2
        
        # Simple filled rounded rectangle
        radius = size // 8
        draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=color1)
        
        # Add text
        text = "URS"
        font_size = size // 3
        # Use default font or specify a path to a TTF file
        # font = ImageFont.truetype("arial.ttf", font_size)
        # For now, use default font
        
        # Calculate text position (centered)
        text_bbox = draw.textbbox((0, 0), text)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), text, fill='white')
        
        # Save the image
        img.save(f'icon-{size}.png')
        print(f'Created icon-{size}.png')
        
except ImportError:
    print("Pillow is not installed. Install it with: pip install Pillow")
    print("Or use the icons.html file to manually save the icons.")
