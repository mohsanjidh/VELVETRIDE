import os

html_files = ['index.html', 'fleet.html', 'services.html', 'about.html', 'contact.html']

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Footer text (and hero subtitle)
    old_text = "All kinds of luxury, modified, imported, and normal cars available for daily, weekly, or monthly rent. Cars under all budgets available."
    new_text = "All kinds of luxury, modified, imported, and normal cars available for hourly rentals. Flexible 8-hour, 12-hour, and 24-hour packages across Kerala."
    content = content.replace(old_text, new_text)
    
    # 2. Booking Grid (index.html)
    old_booking_locations = """            <option value="">Select City</option>
            <option>Mumbai</option>
            <option>Delhi</option>
            <option>Bangalore</option>
            <option>Chennai</option>
            <option>Hyderabad</option>
            <option>Pune</option>
            <option>Kochi</option>
            <option>Jaipur</option>
            <option>Goa</option>"""
    new_booking_locations = """            <option value="">Select City</option>
            <option>Kochi</option>
            <option>Trivandrum</option>
            <option>Kozhikode</option>
            <option>Thrissur</option>
            <option>Ernakulam</option>"""
    content = content.replace(old_booking_locations, new_booking_locations)
    
    old_return_date = """        <div class="booking-field">
          <label>📅 Return Date</label>
          <input type="date" id="bookReturn">
        </div>"""
    new_return_date = """        <div class="booking-field">
          <label>⏰ Duration</label>
          <select id="bookDuration">
            <option value="">Select Duration</option>
            <option>4 Hours</option>
            <option>8 Hours</option>
            <option>12 Hours</option>
            <option>24 Hours</option>
          </select>
        </div>"""
    content = content.replace(old_return_date, new_return_date)
    
    # 3. Enquiry Form (contact.html)
    old_contact_cities = """              <option value="">Select City</option>
              <option>Mumbai</option><option>Delhi</option><option>Bangalore</option>
              <option>Chennai</option><option>Hyderabad</option><option>Goa</option><option>Kochi</option>"""
    new_contact_cities = """              <option value="">Select City</option>
              <option>Kochi</option><option>Trivandrum</option><option>Kozhikode</option>
              <option>Thrissur</option><option>Ernakulam</option>"""
    content = content.replace(old_contact_cities, new_contact_cities)
    
    old_contact_period = "<option>Daily</option><option>Weekly</option><option>Monthly</option><option>Custom</option>"
    new_contact_period = "<option>4 Hours</option><option>8 Hours</option><option>12 Hours</option><option>24 Hours</option><option>Custom</option>"
    content = content.replace(old_contact_period, new_contact_period)
    
    old_hq = "VelvetRide HQ, Bandra West, Mumbai – 400050"
    new_hq = "VelvetRide HQ, MG Road, Kochi – 682016"
    content = content.replace(old_hq, new_hq)
    
    # Also replace any other stray occurrences of Mumbai in text (like testimonials if they existed, but I deleted them)
    # Just to be sure, any stray Mumbai -> Kochi
    content = content.replace("Mumbai", "Kochi")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

for f in html_files:
    if os.path.exists(f):
        process_file(f)

print("Updates applied.")
