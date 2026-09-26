import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6] # completely blank layout

    # Color Palette: Vibrant / Creative with Warm Accents
    DARK_BG = RGBColor(15, 23, 42)        # Slate 900 #0F172A
    DARK_CARD = RGBColor(30, 41, 59)      # Slate 800 #1E293B
    DARK_BORDER = RGBColor(51, 65, 85)    # Slate 700 #334155
    
    LIGHT_BG = RGBColor(248, 250, 252)    # Slate 50 #F8FAFC
    WHITE_CARD = RGBColor(255, 255, 255)  # Pure White
    CARD_BORDER = RGBColor(226, 232, 240) # Slate 200 #E2E8F0
    WARM_CARD_BG = RGBColor(255, 247, 237)# Amber/Orange soft tint #FFF7ED
    WARM_BORDER = RGBColor(254, 215, 170) # Amber 200
    
    ACCENT_ORANGE = RGBColor(249, 115, 22) # Vibrant Sunset Orange #F97316
    ACCENT_AMBER = RGBColor(245, 158, 11)  # Warm Amber #F59E0B
    ACCENT_CORAL = RGBColor(239, 68, 68)   # Warm Coral/Red #EF4444
    ACCENT_TEAL = RGBColor(14, 165, 233)   # Sky / Cyan accent #0EA5E9
    ACCENT_GREEN = RGBColor(16, 185, 129)  # Emerald Green #10B981
    
    TEXT_DARK = RGBColor(15, 23, 42)       # #0F172A
    TEXT_MUTED = RGBColor(100, 116, 139)   # #64748B
    TEXT_LIGHT = RGBColor(241, 245, 249)   # #F1F5F9
    TEXT_LIGHT_MUTED = RGBColor(148, 163, 184) # #94A3B8
    
    CODE_BG = RGBColor(24, 24, 37)         # Dark editor #181825
    CODE_TEXT = RGBColor(248, 250, 252)

    FONT_FAMILY = "Segoe UI"
    CODE_FONT = "Consolas"

    def set_slide_bg(slide, color):
        bg = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5)
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_kicker(slide, text, top=0.45, left=0.8, color=ACCENT_ORANGE):
        tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(8), Inches(0.35))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = text.upper()
        p.font.name = FONT_FAMILY
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = color
        return tb

    def add_header(slide, title_text, subtitle_text=None, top=0.75, left=0.8, is_dark=False):
        tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(11.7), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = FONT_FAMILY
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT if is_dark else TEXT_DARK
        
        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.font.name = FONT_FAMILY
            p2.font.size = Pt(12)
            p2.font.color.rgb = TEXT_LIGHT_MUTED if is_dark else TEXT_MUTED
            p2.space_before = Pt(4)
        return tb

    def add_card(slide, left, top, width, height, bg_color=WHITE_CARD, border_color=CARD_BORDER, shape_type=MSO_SHAPE.ROUNDED_RECTANGLE):
        card = slide.shapes.add_shape(
            shape_type, Inches(left), Inches(top), Inches(width), Inches(height)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.2)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Modern Dark Creative Theme)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s1, DARK_BG)

    # Decorative warm glow accent cards
    glow1 = add_card(s1, 0.8, 1.2, 0.4, 4.8, bg_color=ACCENT_ORANGE, border_color=None, shape_type=MSO_SHAPE.ROUNDED_RECTANGLE)
    glow2 = add_card(s1, 1.3, 1.2, 0.15, 4.8, bg_color=ACCENT_AMBER, border_color=None, shape_type=MSO_SHAPE.ROUNDED_RECTANGLE)

    # Title content frame
    tb1 = s1.shapes.add_textbox(Inches(1.8), Inches(1.5), Inches(10.5), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p = tf1.paragraphs[0]
    p.text = "DATA STRUCTURES MASTERCLASS"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p.space_after = Pt(10)

    p = tf1.add_paragraph()
    p.text = "Arrays & Linked Lists"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.space_after = Pt(8)

    p = tf1.add_paragraph()
    p.text = "A Deep Dive into 1D/2D Lists, Pointer Topologies, and Algorithmic Mechanics"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.color.rgb = TEXT_LIGHT_MUTED
    p.space_after = Pt(28)

    # 4 Module Badges along the bottom
    modules = [
        ("01", "Array via List", ACCENT_ORANGE),
        ("02", "1D & 2D Matrix", ACCENT_AMBER),
        ("03", "Singly/Doubly/Circular", ACCENT_TEAL),
        ("04", "Insert, Delete, Search", ACCENT_GREEN)
    ]
    for i, (num, name, col) in enumerate(modules):
        x = 1.8 + i * 2.7
        # Card container
        add_card(s1, x, 4.8, 2.5, 1.3, bg_color=DARK_CARD, border_color=DARK_BORDER)
        # Small accent strip on top of card
        add_card(s1, x, 4.8, 2.5, 0.08, bg_color=col, border_color=None, shape_type=MSO_SHAPE.RECTANGLE)
        
        tb = s1.shapes.add_textbox(Inches(x + 0.2), Inches(5.05), Inches(2.1), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        p.text = f"MODULE {num}"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = name
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT
        p2.space_before = Pt(3)

    # =========================================================================
    # SLIDE 2: THE BIG PICTURE: MEMORY & ACCESS PARADIGM
    # =========================================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s2, LIGHT_BG)
    add_kicker(s2, "Architectural Foundations • Memory Paradigm")
    add_header(s2, "Contiguous Memory vs. Dynamic Pointer Chaining", 
               "Understanding how hardware memory layout dictates time complexity and efficiency.")

    # Left Card: Arrays
    add_card(s2, 0.8, 2.0, 5.65, 4.2, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    # Header tag in card
    add_card(s2, 1.1, 2.3, 1.6, 0.35, bg_color=RGBColor(254, 242, 242), border_color=RGBColor(254, 202, 202))
    tb = s2.shapes.add_textbox(Inches(1.1), Inches(2.35), Inches(1.6), Inches(0.3))
    tb.text_frame.paragraphs[0].text = "ARRAY PARADIGM"
    tb.text_frame.paragraphs[0].font.name = FONT_FAMILY
    tb.text_frame.paragraphs[0].font.size = Pt(9.5)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = ACCENT_CORAL
    tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb = s2.shapes.add_textbox(Inches(1.1), Inches(2.8), Inches(5.05), Inches(3.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p = tf.paragraphs[0]
    p.text = "Contiguous Memory Blocks"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    points_array = [
        ("Direct Address Math", "Access any index instantly via Base_Addr + (index * elem_size)."),
        ("Cache Line Optimal", "CPU pre-fetches neighboring elements into L1/L2 cache effortlessly."),
        ("Expensive Resizing", "Inserting at index 0 requires shifting every existing item right: O(n).")
    ]
    for title, desc in points_array:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Right Card: Linked Lists
    add_card(s2, 6.85, 2.0, 5.65, 4.2, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    add_card(s2, 7.15, 2.3, 2.1, 0.35, bg_color=RGBColor(238, 242, 255), border_color=RGBColor(199, 210, 254))
    tb = s2.shapes.add_textbox(Inches(7.15), Inches(2.35), Inches(2.1), Inches(0.3))
    tb.text_frame.paragraphs[0].text = "LINKED LIST PARADIGM"
    tb.text_frame.paragraphs[0].font.name = FONT_FAMILY
    tb.text_frame.paragraphs[0].font.size = Pt(9.5)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = ACCENT_TEAL
    tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb = s2.shapes.add_textbox(Inches(7.15), Inches(2.8), Inches(5.05), Inches(3.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Scattered Dynamic Nodes"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    points_ll = [
        ("Non-Contiguous Heap", "Nodes live anywhere in RAM and link via memory address pointers."),
        ("Instant Re-pointing", "Insert/Delete at known node requires only pointer rewire: O(1)."),
        ("Sequential Traversal", "No random access: accessing k-th node requires hopping k pointers: O(n).")
    ]
    for title, desc in points_ll:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Bottom Callout Summary
    add_card(s2, 0.8, 6.35, 11.7, 0.7, bg_color=WARM_CARD_BG, border_color=WARM_BORDER)
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(6.45), Inches(11.3), Inches(0.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "KEY TAKEAWAY: "
    p.font.name = FONT_FAMILY
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_ORANGE
    run = p.add_run()
    run.text = "Arrays optimize for instantaneous random reading; Linked Lists optimize for continuous dynamic mutation."
    run.font.bold = False
    run.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 3: ARRAY IMPLEMENTATION USING PYTHON LIST
    # =========================================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s3, LIGHT_BG)
    add_kicker(s3, "Module 01 • Array Mechanics")
    add_header(s3, "Array Implementation via Python Lists", 
               "How Python builds dynamic, over-allocated pointer arrays under the hood.")

    # Left Column: Mechanics & Dynamic Growth
    add_card(s3, 0.8, 2.0, 5.7, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s3.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.1), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Internal CPython Architecture"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    c_points = [
        ("Array of References", "A Python list stores contiguous memory addresses pointing to objects, enabling heterogeneous storage."),
        ("Dynamic Over-allocation", "When capacity is exhausted, CPython resizes using an aggressive growth formula (0, 4, 8, 16, 24, 32...) to guarantee O(1) amortized appends."),
        ("Direct Index Access", "arr[i] translates to a simple pointer dereference at index offset.")
    ]
    for title, desc in c_points:
        p = tf.add_paragraph()
        p.text = f"{title}\n"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = ACCENT_ORANGE
        p.space_before = Pt(8)
        run = p.add_run()
        run.text = desc
        run.font.name = FONT_FAMILY
        run.font.size = Pt(11)
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Right Column: Visual Complexity Cards + Code Snippet
    stats = [
        ("Access", "O(1)", ACCENT_GREEN),
        ("Append", "O(1)*", ACCENT_GREEN),
        ("Insert(0)", "O(n)", ACCENT_ORANGE),
        ("Delete", "O(n)", ACCENT_ORANGE)
    ]
    for i, (label, val, col) in enumerate(stats):
        x = 6.8 + i * 1.45
        add_card(s3, x, 2.0, 1.35, 0.95, bg_color=WHITE_CARD, border_color=CARD_BORDER)
        tb = s3.shapes.add_textbox(Inches(x), Inches(2.1), Inches(1.35), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = FONT_FAMILY
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col
        p.alignment = PP_ALIGN.CENTER
        p2 = tf.add_paragraph()
        p2.text = label
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_MUTED
        p2.alignment = PP_ALIGN.CENTER

    # Code card on bottom right
    add_card(s3, 6.8, 3.1, 5.7, 3.8, bg_color=CODE_BG, border_color=None)
    add_card(s3, 6.8, 3.1, 5.7, 0.4, bg_color=RGBColor(36, 36, 54), border_color=None, shape_type=MSO_SHAPE.RECTANGLE)
    tb = s3.shapes.add_textbox(Inches(7.0), Inches(3.18), Inches(5.0), Inches(0.3))
    tb.text_frame.paragraphs[0].text = "python_list_operations.py"
    tb.text_frame.paragraphs[0].font.name = CODE_FONT
    tb.text_frame.paragraphs[0].font.size = Pt(9.5)
    tb.text_frame.paragraphs[0].font.color.rgb = TEXT_LIGHT_MUTED

    code_text = (
        "# 1. Initialize Dynamic List\n"
        "numbers = [10, 20, 30, 40]\n\n"
        "# 2. O(1) Instant Random Access\n"
        "val = numbers[2]       # Returns 30\n\n"
        "# 3. O(1) Amortized Append\n"
        "numbers.append(50)     # Adds to end\n\n"
        "# 4. O(n) Shifting Insertion\n"
        "numbers.insert(0, 99)  # Shifts all elements right"
    )
    tb = s3.shapes.add_textbox(Inches(7.0), Inches(3.65), Inches(5.3), Inches(3.1))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = code_text
    p.font.name = CODE_FONT
    p.font.size = Pt(10.5)
    p.font.color.rgb = CODE_TEXT

    # =========================================================================
    # SLIDE 4: 1D VS 2D ARRAYS (NESTED LISTS)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s4, LIGHT_BG)
    add_kicker(s4, "Module 02 • Multi-Dimensional Data")
    add_header(s4, "1D vs. 2D Arrays (Nested Lists & Matrices)", 
               "Structuring linear coordinate systems and nested multi-dimensional grids in memory.")

    # 3 Cards Layout: 1D Vector, 2D Grid Matrix, Traversal Patterns
    # Card 1: 1D Linear Vector
    add_card(s4, 0.8, 2.0, 3.65, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s4.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(3.25), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "1D Linear Vector"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(6)

    p = tf.add_paragraph()
    p.text = "Single contiguous row with index range [0 .. N-1]."
    p.font.name = FONT_FAMILY
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(12)

    # Visual blocks for 1D
    for idx, val in enumerate([15, 28, 42, 99]):
        bx = 1.0 + idx * 0.78
        add_card(s4, bx, 3.3, 0.72, 0.65, bg_color=RGBColor(241, 245, 249), border_color=ACCENT_ORANGE)
        tb_b = s4.shapes.add_textbox(Inches(bx), Inches(3.35), Inches(0.72), Inches(0.55))
        tb_b.text_frame.paragraphs[0].text = str(val)
        tb_b.text_frame.paragraphs[0].font.name = CODE_FONT
        tb_b.text_frame.paragraphs[0].font.size = Pt(11.5)
        tb_b.text_frame.paragraphs[0].font.bold = True
        tb_b.text_frame.paragraphs[0].font.color.rgb = TEXT_DARK
        tb_b.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        
        # index label above
        tb_idx = s4.shapes.add_textbox(Inches(bx), Inches(3.0), Inches(0.72), Inches(0.3))
        tb_idx.text_frame.paragraphs[0].text = f"[{idx}]"
        tb_idx.text_frame.paragraphs[0].font.name = CODE_FONT
        tb_idx.text_frame.paragraphs[0].font.size = Pt(9)
        tb_idx.text_frame.paragraphs[0].font.color.rgb = ACCENT_ORANGE
        tb_idx.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb_desc = s4.shapes.add_textbox(Inches(1.0), Inches(4.2), Inches(3.25), Inches(2.5))
    tf_desc = tb_desc.text_frame
    tf_desc.word_wrap = True
    p = tf_desc.paragraphs[0]
    p.text = "Key Properties:\n• Direct memory stride\n• O(1) read & write\n• Linear iteration: O(n)\n• Ideal for sequences & queues"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Card 2: 2D Matrix (List of Lists)
    add_card(s4, 4.8, 2.0, 3.8, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s4.shapes.add_textbox(Inches(5.0), Inches(2.2), Inches(3.4), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "2D Nested Matrix"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(6)

    p = tf.add_paragraph()
    p.text = "matrix[row][col] addressing."
    p.font.name = FONT_FAMILY
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # Draw 3x3 visual matrix
    matrix_vals = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    for r in range(3):
        for c in range(3):
            mx = 5.3 + c * 0.85
            my = 3.2 + r * 0.7
            is_diag = (r == c)
            bg_c = RGBColor(255, 237, 213) if is_diag else RGBColor(248, 250, 252)
            bd_c = ACCENT_ORANGE if is_diag else CARD_BORDER
            add_card(s4, mx, my, 0.78, 0.62, bg_color=bg_c, border_color=bd_c)
            
            tb_m = s4.shapes.add_textbox(Inches(mx), Inches(my + 0.08), Inches(0.78), Inches(0.5))
            tb_m.text_frame.paragraphs[0].text = str(matrix_vals[r][c])
            tb_m.text_frame.paragraphs[0].font.name = CODE_FONT
            tb_m.text_frame.paragraphs[0].font.size = Pt(11.5)
            tb_m.text_frame.paragraphs[0].font.bold = True
            tb_m.text_frame.paragraphs[0].font.color.rgb = ACCENT_ORANGE if is_diag else TEXT_DARK
            tb_m.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb_m_desc = s4.shapes.add_textbox(Inches(5.0), Inches(5.4), Inches(3.4), Inches(1.4))
    tf_m_desc = tb_m_desc.text_frame
    tf_m_desc.word_wrap = True
    p = tf_m_desc.paragraphs[0]
    p.text = "In Python, a 2D matrix is a list containing references to inner list objects."
    p.font.name = FONT_FAMILY
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Card 3: Traversal & Flattening Logic
    add_card(s4, 8.85, 2.0, 3.65, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s4.shapes.add_textbox(Inches(9.05), Inches(2.2), Inches(3.25), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Matrix Algorithms"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    matrix_rules = [
        ("Row-Major Traversal", "Nested loops iterating row by row: O(R × C) time complexity."),
        ("Coordinate Lookup", "Direct indexing: val = matrix[r][c] runs in O(1) time."),
        ("1D Flattening Math", "Map 2D (r,c) to 1D index:\nindex = (r * COLS) + c"),
        ("Use Cases", "Image processing pixels, game boards (Chess/Sudoku), Graph adjacency matrices.")
    ]
    for title, desc in matrix_rules:
        p = tf.add_paragraph()
        p.text = f"{title}\n"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.name = FONT_FAMILY
        run.font.size = Pt(10)
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 5: LINKED LIST ARCHITECTURE & SINGLY LINKED LIST
    # =========================================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s5, LIGHT_BG)
    add_kicker(s5, "Module 03 • Node Topologies")
    add_header(s5, "Singly Linked List Architecture", 
               "Dynamic non-contiguous memory nodes linked through directional pointer references.")

    # Visual Node Diagram at Top
    add_card(s5, 0.8, 1.95, 11.7, 1.85, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    
    node_values = ["12", "45", "89"]
    for i, val in enumerate(node_values):
        nx = 1.3 + i * 3.3
        ny = 2.4
        add_card(s5, nx, ny, 2.3, 1.05, bg_color=RGBColor(248, 250, 252), border_color=ACCENT_TEAL)
        add_card(s5, nx, ny, 1.4, 1.05, bg_color=RGBColor(238, 242, 255), border_color=ACCENT_TEAL, shape_type=MSO_SHAPE.RECTANGLE)
        tb_d = s5.shapes.add_textbox(Inches(nx), Inches(ny + 0.15), Inches(1.4), Inches(0.8))
        tb_d.text_frame.paragraphs[0].text = f"Data\n{val}"
        tb_d.text_frame.paragraphs[0].font.name = FONT_FAMILY
        tb_d.text_frame.paragraphs[0].font.size = Pt(11.5)
        tb_d.text_frame.paragraphs[0].font.bold = True
        tb_d.text_frame.paragraphs[0].font.color.rgb = TEXT_DARK
        tb_d.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        
        tb_n = s5.shapes.add_textbox(Inches(nx + 1.4), Inches(ny + 0.15), Inches(0.9), Inches(0.8))
        tb_n.text_frame.paragraphs[0].text = "Next\n[ • ]"
        tb_n.text_frame.paragraphs[0].font.name = FONT_FAMILY
        tb_n.text_frame.paragraphs[0].font.size = Pt(11)
        tb_n.text_frame.paragraphs[0].font.bold = True
        tb_n.text_frame.paragraphs[0].font.color.rgb = ACCENT_TEAL
        tb_n.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        if i < len(node_values) - 1:
            tb_arr = s5.shapes.add_textbox(Inches(nx + 2.3), Inches(ny + 0.25), Inches(1.0), Inches(0.5))
            tb_arr.text_frame.paragraphs[0].text = "──────►"
            tb_arr.text_frame.paragraphs[0].font.name = CODE_FONT
            tb_arr.text_frame.paragraphs[0].font.size = Pt(14)
            tb_arr.text_frame.paragraphs[0].font.bold = True
            tb_arr.text_frame.paragraphs[0].font.color.rgb = ACCENT_ORANGE
            tb_arr.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
        else:
            tb_null = s5.shapes.add_textbox(Inches(nx + 2.3), Inches(ny + 0.2), Inches(1.2), Inches(0.6))
            tb_null.text_frame.paragraphs[0].text = "──► NULL"
            tb_null.text_frame.paragraphs[0].font.name = CODE_FONT
            tb_null.text_frame.paragraphs[0].font.size = Pt(12)
            tb_null.text_frame.paragraphs[0].font.bold = True
            tb_null.text_frame.paragraphs[0].font.color.rgb = ACCENT_CORAL
            tb_null.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Bottom Two Columns: Anatomical Details & Python Implementation
    add_card(s5, 0.8, 4.0, 5.7, 2.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s5.shapes.add_textbox(Inches(1.1), Inches(4.15), Inches(5.1), Inches(2.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Node Anatomy & Pointer Mechanics"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(14.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(6)

    singly_points = [
        ("The Head Pointer", "Stores address of the 1st node. If Head is None, list is empty."),
        ("Uni-directional Navigation", "Traversals are strictly forward. Moving backwards requires starting from Head."),
        ("Dynamic Heap Allocation", "Zero memory reallocation or element copying when inserting.")
    ]
    for title, desc in singly_points:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(4)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Python Node Class Box
    add_card(s5, 6.8, 4.0, 5.7, 2.9, bg_color=CODE_BG, border_color=None)
    tb = s5.shapes.add_textbox(Inches(7.0), Inches(4.15), Inches(5.3), Inches(2.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "# Python Singly Linked List Node Definition\nclass Node:\n    def __init__(self, data):\n        self.data = data      # Stores payload value\n        self.next = None      # Reference to next node\n\nclass SinglyLinkedList:\n    def __init__(self):\n        self.head = None      # Points to initial node"
    p.font.name = CODE_FONT
    p.font.size = Pt(10)
    p.font.color.rgb = CODE_TEXT

    # =========================================================================
    # SLIDE 6: DOUBLY & CIRCULAR LINKED LISTS
    # =========================================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s6, LIGHT_BG)
    add_kicker(s6, "Module 03 • Advanced Topologies")
    add_header(s6, "Doubly & Circular Linked Lists", 
               "Exploring bidirectional pointer navigation and endless loop circular structures.")

    # Left Half: Doubly Linked List
    add_card(s6, 0.8, 2.0, 5.7, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    add_card(s6, 1.1, 2.2, 2.3, 0.35, bg_color=RGBColor(254, 243, 199), border_color=RGBColor(252, 211, 77))
    tb = s6.shapes.add_textbox(Inches(1.1), Inches(2.25), Inches(2.3), Inches(0.3))
    tb.text_frame.paragraphs[0].text = "DOUBLY LINKED LIST (DLL)"
    tb.text_frame.paragraphs[0].font.name = FONT_FAMILY
    tb.text_frame.paragraphs[0].font.size = Pt(9)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = ACCENT_AMBER
    tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb = s6.shapes.add_textbox(Inches(1.1), Inches(2.7), Inches(5.1), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Bidirectional Navigation"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Visual Structure:\nNULL ◄── [ Prev | Data | Next ] ◄══► [ Prev | Data | Next ] ──► NULL\n"
    p.font.name = CODE_FONT
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_ORANGE
    p.space_after = Pt(6)

    dll_features = [
        ("Two Pointers per Node", "Each node maintains both 'prev' and 'next' references."),
        ("O(1) Reverse Step", "Can traverse forwards and backwards with equal speed."),
        ("O(1) Self Deletion", "Given node pointer P, can delete instantly without searching for previous node: P.prev.next = P.next."),
        ("Trade-off", "Requires ~33% more memory overhead per node for extra pointer.")
    ]
    for title, desc in dll_features:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(4)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Right Half: Circular Linked List
    add_card(s6, 6.8, 2.0, 5.7, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    add_card(s6, 7.1, 2.2, 2.4, 0.35, bg_color=RGBColor(236, 253, 245), border_color=RGBColor(167, 243, 208))
    tb = s6.shapes.add_textbox(Inches(7.1), Inches(2.25), Inches(2.4), Inches(0.3))
    tb.text_frame.paragraphs[0].text = "CIRCULAR LINKED LIST (CLL)"
    tb.text_frame.paragraphs[0].font.name = FONT_FAMILY
    tb.text_frame.paragraphs[0].font.size = Pt(9)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = ACCENT_GREEN
    tb.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    tb = s6.shapes.add_textbox(Inches(7.1), Inches(2.7), Inches(5.1), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Continuous Ring Topology"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Visual Structure:\n[ HEAD ] ──► [ Node 1 ] ──► [ Node 2 ] ──► [ Node 3 ] ──┐\n   ▲                                                      │\n   └──────────────────────────────────────────────────────┘\n"
    p.font.name = CODE_FONT
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p.space_after = Pt(6)

    cll_features = [
        ("No NULL Terminus", "The last node's 'next' pointer wraps around to point back to Head."),
        ("Singly & Doubly Circular", "Can be single ring or dual ring (last.next=head & head.prev=last)."),
        ("Real-World Use Cases", "OS Round-Robin CPU scheduling, continuous media playlist repeat, multiplayer gaming turn queues."),
        ("Caution", "Must prevent infinite loops by tracking starting node or using two pointers.")
    ]
    for title, desc in cll_features:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(4)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: LINKED LIST CORE OPERATIONS (INSERTION & DELETION)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s7, LIGHT_BG)
    add_kicker(s7, "Module 04 • Core Algorithmic Operations")
    add_header(s7, "Insertion & Deletion Operations", 
               "Executing surgical pointer rewiring without shifting adjacent memory blocks.")

    ops = [
        ("01. Insert at Head", "O(1) Time", ACCENT_GREEN, [
            "1. Allocate new Node(val)",
            "2. Point newNode.next = head",
            "3. Update head = newNode",
            "✓ Instant: zero shifting required regardless of list length."
        ]),
        ("02. Insert at Position k", "O(n) Time", ACCENT_ORANGE, [
            "1. Traverse to (k-1)th node (prev)",
            "2. newNode.next = prev.next",
            "3. prev.next = newNode",
            "✓ Traversal is O(n), but physical reconnection is O(1)."
        ]),
        ("03. Delete by Value", "O(n) Time", ACCENT_CORAL, [
            "1. Traverse to find target node & prev",
            "2. Rewire: prev.next = target.next",
            "3. Delete target (GC frees RAM)",
            "✓ If target is Head: head = head.next"
        ])
    ]

    for i, (title, comp, col, steps) in enumerate(ops):
        x = 0.8 + i * 3.95
        add_card(s7, x, 2.0, 3.8, 3.4, bg_color=WHITE_CARD, border_color=CARD_BORDER)
        add_card(s7, x, 2.0, 3.8, 0.08, bg_color=col, border_color=None, shape_type=MSO_SHAPE.RECTANGLE)
        
        tb = s7.shapes.add_textbox(Inches(x + 0.25), Inches(2.2), Inches(3.3), Inches(3.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_FAMILY
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        
        p_c = tf.add_paragraph()
        p_c.text = f"Complexity: {comp}"
        p_c.font.name = FONT_FAMILY
        p_c.font.size = Pt(10.5)
        p_c.font.bold = True
        p_c.font.color.rgb = col
        p_c.space_after = Pt(10)

        for step in steps:
            p_s = tf.add_paragraph()
            p_s.text = step
            p_s.font.name = FONT_FAMILY
            p_s.font.size = Pt(10.5)
            p_s.font.color.rgb = TEXT_MUTED if not step.startswith("✓") else TEXT_DARK
            p_s.font.bold = step.startswith("✓")
            p_s.space_before = Pt(4)

    # Bottom Code Box
    add_card(s7, 0.8, 5.55, 11.7, 1.45, bg_color=CODE_BG, border_color=None)
    tb_c = s7.shapes.add_textbox(Inches(1.0), Inches(5.65), Inches(11.3), Inches(1.25))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = (
        "# Python Implementation: Surgical Pointer Rewiring\n"
        "def insert_after(prev_node, new_data):                 def delete_node(self, key):\n"
        "    if not prev_node: return                               curr, prev = self.head, None\n"
        "    new_node = Node(new_data)                              while curr and curr.data != key:\n"
        "    new_node.next = prev_node.next                             prev, curr = curr, curr.next\n"
        "    prev_node.next = new_node                              if curr: prev.next = curr.next"
    )
    p.font.name = CODE_FONT
    p.font.size = Pt(9.5)
    p.font.color.rgb = CODE_TEXT

    # =========================================================================
    # SLIDE 8: TRAVERSAL & SEARCH ALGORITHMS + EDGE CASES
    # =========================================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s8, LIGHT_BG)
    add_kicker(s8, "Module 04 • Algorithmic Patterns")
    add_header(s8, "Traversal, Search & Critical Edge Cases", 
               "Iterative linear traversal techniques and defensive checks for robust production code.")

    # Left Column: Traversal & Search
    add_card(s8, 0.8, 2.0, 5.7, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s8.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.1), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "Traversal & Search Dynamics"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    trav_points = [
        ("Linear Pointer Progression", "Start at head: current = head. Advance node-by-node: current = current.next until current is None. Time Complexity: O(n)."),
        ("Search / Lookup Protocol", "Compare current.data == target. Return True or Node pointer upon match, or False if reaching end."),
        ("Length Calculation", "Increment counter during traversal. Unlike Arrays (which store length in metadata), standard Linked Lists compute length in O(n) unless tracked.")
    ]
    for title, desc in trav_points:
        p = tf.add_paragraph()
        p.text = f"{title}\n"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = ACCENT_ORANGE
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.name = FONT_FAMILY
        run.font.size = Pt(10.5)
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # Right Column: 4 Defensive Edge Cases
    add_card(s8, 6.8, 2.0, 5.7, 4.9, bg_color=WHITE_CARD, border_color=CARD_BORDER)
    tb = s8.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.1), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "Critical Edge Cases & Safeguards"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

    edge_cases = [
        ("Empty List Scenario", "If head is None, operations like delete, search, or head-insert must not dereference head.next (AttributeError)."),
        ("Single Node List", "Deleting the only node means updating head = None. Tail/prev references must also clear."),
        ("Deleting Head Node", "Special condition: head = head.next. No previous node pointer rewiring exists."),
        ("Cycle Detection", "In circular structures or corrupted lists, use Floyd's Tortoise and Hare algorithm (fast & slow pointers) to prevent infinite loops.")
    ]
    for title, desc in edge_cases:
        p = tf.add_paragraph()
        p.text = f"• {title}: "
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_before = Pt(6)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 9: HEAD-TO-HEAD COMPARISON & COMPLEXITY MATRIX
    # =========================================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s9, LIGHT_BG)
    add_kicker(s9, "Benchmark • Architectural Scorecard")
    add_header(s9, "Head-to-Head Performance Scorecard", 
               "Time complexity and resource consumption comparison across linear structures.")

    rows, cols = 7, 4
    table_shape = s9.shapes.add_table(rows, cols, Inches(0.8), Inches(1.95), Inches(11.7), Inches(5.0))
    table = table_shape.table

    table.columns[0].width = Inches(3.2)
    table.columns[1].width = Inches(2.8)
    table.columns[2].width = Inches(2.85)
    table.columns[3].width = Inches(2.85)

    headers = ["Operation / Metric", "Array / Python List", "Singly Linked List", "Doubly Linked List"]
    data_rows = [
        ("Random Access [Index i]", "O(1) [Instant Math]", "O(n) [Must Traverse]", "O(n) [Must Traverse]"),
        ("Insert / Delete at Beginning", "O(n) [Full Array Shift]", "O(1) [Pointer Rewire]", "O(1) [Pointer Rewire]"),
        ("Insert / Delete at End", "O(1)* [Amortized Append]", "O(n) or O(1) with Tail", "O(1) with Tail Pointer"),
        ("Insert / Delete at Middle", "O(n) [Shift Elements]", "O(1) after O(n) seek", "O(1) after O(n) seek"),
        ("Memory Overhead", "Low (Pure values/ptrs)", "Medium (+1 Ptr per node)", "High (+2 Ptrs per node)"),
        ("CPU Cache Locality", "Excellent (Contiguous)", "Poor (Scattered Heap)", "Poor (Scattered Heap)")
    ]

    for c, text in enumerate(headers):
        cell = table.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_BG
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]
        p.text = text
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT
        p.alignment = PP_ALIGN.CENTER if c > 0 else PP_ALIGN.LEFT

    for r, row_vals in enumerate(data_rows, start=1):
        bg_row = RGBColor(255, 255, 255) if r % 2 == 1 else RGBColor(248, 250, 252)
        for c, val in enumerate(row_vals):
            cell = table.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg_row
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = FONT_FAMILY
            p.font.size = Pt(10.5)
            p.font.bold = (c == 0)
            
            if "O(1)" in val and "O(n)" not in val:
                p.font.color.rgb = ACCENT_GREEN
                p.font.bold = True
            elif "O(n)" in val:
                p.font.color.rgb = ACCENT_ORANGE
            elif "Excellent" in val:
                p.font.color.rgb = ACCENT_GREEN
                p.font.bold = True
            elif "Poor" in val or "High" in val:
                p.font.color.rgb = ACCENT_CORAL
            else:
                p.font.color.rgb = TEXT_DARK
            
            p.alignment = PP_ALIGN.CENTER if c > 0 else PP_ALIGN.LEFT

    # =========================================================================
    # SLIDE 10: EXECUTIVE SUMMARY & DECISION PLAYBOOK (Dark Creative Theme)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_bg(s10, DARK_BG)
    add_kicker(s10, "Summary • Architectural Playbook", color=ACCENT_AMBER)
    add_header(s10, "When to Choose Which Data Structure", 
               "Concrete decision rules for software engineers and systems architects.", is_dark=True)

    decisions = [
        ("CHOOSE ARRAYS / PYTHON LISTS WHEN...", ACCENT_ORANGE, [
            "• Read-heavy workloads requiring fast random index lookups O(1).",
            "• Predictable dataset sizes with infrequent insertions at the beginning.",
            "• CPU cache locality and minimal memory footprint are paramount.",
            "• 2D/3D numerical matrix algebra, games, and machine learning tensors."
        ]),
        ("CHOOSE LINKED LISTS WHEN...", ACCENT_TEAL, [
            "• Frequent insertions and deletions at the head or within streams: O(1).",
            "• Unknown, wildly fluctuating memory allocations where resizing is costly.",
            "• Building foundation abstractions: Stacks, Queues, Graphs, and Hash Chaining.",
            "• Memory fragmentation prevents allocating large contiguous blocks."
        ]),
        ("MODERN HYBRID ALTERNATIVES IN PYTHON", ACCENT_AMBER, [
            "• collections.deque: Double-ended queue with O(1) appends and pops from both ends.",
            "• array.array / numpy.ndarray: High-performance contiguous C-style typed arrays.",
            "• heapq / PriorityQueue: Tree-backed heap for prioritized sequence management."
        ])
    ]

    for i, (heading, col, bullet_list) in enumerate(decisions):
        x = 0.8 + i * 3.95
        add_card(s10, x, 2.0, 3.8, 4.4, bg_color=DARK_CARD, border_color=DARK_BORDER)
        add_card(s10, x, 2.0, 3.8, 0.08, bg_color=col, border_color=None, shape_type=MSO_SHAPE.RECTANGLE)
        
        tb = s10.shapes.add_textbox(Inches(x + 0.2), Inches(2.2), Inches(3.4), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = heading
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_after = Pt(12)

        for b in bullet_list:
            p_b = tf.add_paragraph()
            p_b.text = b
            p_b.font.name = FONT_FAMILY
            p_b.font.size = Pt(10.5)
            p_b.font.color.rgb = TEXT_LIGHT_MUTED
            p_b.space_before = Pt(6)

    tb_end = s10.shapes.add_textbox(Inches(0.8), Inches(6.6), Inches(11.7), Inches(0.4))
    tf_end = tb_end.text_frame
    p_end = tf_end.paragraphs[0]
    p_end.text = "Arrays & Linked Lists Masterclass • Professional Presentation Deck"
    p_end.font.name = FONT_FAMILY
    p_end.font.size = Pt(10)
    p_end.font.color.rgb = DARK_BORDER
    p_end.alignment = PP_ALIGN.CENTER

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    out_dir = r"c:\Users\chand\OneDrive\Desktop\project"
    out_file = os.path.join(out_dir, "Arrays_and_Linked_Lists_Masterclass.pptx")
    create_presentation(out_file)
