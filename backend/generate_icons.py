"""
Generate placeholder icons for URS Chrome Extension
This creates simple SVG-based icons with the URS branding
"""

import os
import base64
from pathlib import Path

def create_svg_icon(size):
    """Create an SVG icon with URS text"""
    svg = f'''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" rx="{size//8}" fill="url(#grad1)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="{size//3}px" font-weight="bold" fill="white">
    URS
  </text>
</svg>'''
    return svg

def svg_to_png_data_url(svg_content, size):
    """Convert SVG to PNG data URL (placeholder - returns SVG as data URL)"""
    # Note: For actual PNG conversion, you'd need a library like cairosvg or Pillow
    # This creates a data URL from the SVG which modern browsers can use
    svg_bytes = svg_content.encode('utf-8')
    svg_base64 = base64.b64encode(svg_bytes).decode('utf-8')
    return f'data:image/svg+xml;base64,{svg_base64}'

def create_icon_html(sizes):
    """Create an HTML file to display and save the icons"""
    html = '''<!DOCTYPE html>
<html>
<head>
    <title>URS Chrome Extension Icons</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f0f0f0;
        }
        .icon-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .icon-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .icon-box h3 {
            margin: 10px 0 5px 0;
            color: #333;
        }
        .icon-box p {
            margin: 0;
            color: #666;
            font-size: 12px;
        }
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>URS Chrome Extension Icons</h1>
    <div class="instructions">
        <strong>Instructions:</strong> Right-click on each icon and select "Save image as..." to save them as PNG files.
        <br>Save them in the <code>icons/</code> folder with the names shown below each icon.
    </div>
    <div class="icon-container">
'''
    
    for size in sizes:
        svg = create_svg_icon(size)
        data_url = svg_to_png_data_url(svg, size)
        html += f'''
        <div class="icon-box">
            <img src="{data_url}" width="{size}" height="{size}" alt="Icon {size}x{size}">
            <h3>icon-{size}.png</h3>
            <p>{size}x{size} pixels</p>
        </div>
'''
    
    html += '''
    </div>
</body>
</html>'''
    return html

def main():
    # Icon sizes needed for Chrome extension
    sizes = [16, 32, 48, 128]
    
    # Create icons directory
    icons_dir = Path(__file__).parent.parent / 'icons'
    icons_dir.mkdir(exist_ok=True)
    
    # Generate SVG files
    for size in sizes:
        svg_content = create_svg_icon(size)
        svg_path = icons_dir / f'icon-{size}.svg'
        with open(svg_path, 'w') as f:
            f.write(svg_content)
        print(f"Created {svg_path}")
    
    # Create HTML file for manual conversion
    html_content = create_icon_html(sizes)
    html_path = icons_dir / 'icons.html'
    with open(html_path, 'w') as f:
        f.write(html_content)
    print(f"\nCreated {html_path}")
    print("\nOpen this HTML file in Chrome to save the icons as PNG files.")
    print("Right-click each icon and save them with the names shown.")
    
    # Also create a simple Python script using Pillow if available
    create_png_script = '''
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
'''
    
    script_path = icons_dir / 'generate_png.py'
    with open(script_path, 'w') as f:
        f.write(create_png_script)
    print(f"\nAlso created {script_path} for generating PNG files with Pillow (if installed)")

if __name__ == "__main__":
    main()
