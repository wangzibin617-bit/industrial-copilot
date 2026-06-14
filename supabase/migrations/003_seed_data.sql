-- ============================================================
-- Industrial Copilot MVP 0.2 -- Seed Data
-- Brands: Schneider Electric + XINJE Electric
-- Note: All parameters are examples, refer to official documentation
-- ============================================================

-- ============================================================
-- BRANDS
-- ============================================================
INSERT INTO public.brands (id, name, name_en, slug, source_note) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Schneider Electric', 'Schneider Electric', 'schneider', 'platform seed data - example'),
  ('a0000000-0000-0000-0000-000000000002', 'XINJE Electric', 'XINJE Electric', 'xinje', 'platform seed data - example');

-- ============================================================
-- PRODUCT CATEGORIES (brand-agnostic top-level)
-- ============================================================
INSERT INTO public.product_categories (id, name, slug, parent_id, source_note) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'PLC', 'plc', NULL, 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000002', 'HMI', 'hmi', NULL, 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000003', 'VFD', 'vfd', NULL, 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000004', 'Servo', 'servo', NULL, 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000005', 'Low Voltage', 'low-voltage', NULL, 'platform seed data');

-- Sub-categories
INSERT INTO public.product_categories (id, name, slug, parent_id, source_note) VALUES
  ('b0000000-0000-0000-0000-000000000011', 'Compact PLC', 'compact-plc', 'b0000000-0000-0000-0000-000000000001', 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000021', 'Touch Screen', 'touch-screen', 'b0000000-0000-0000-0000-000000000002', 'platform seed data'),
  ('b0000000-0000-0000-0000-000000000031', 'General VFD', 'general-vfd', 'b0000000-0000-0000-0000-000000000003', 'platform seed data');

-- ============================================================
-- PRODUCTS (20 items, example data)
-- ============================================================

-- —— Schneider Electric (10 items) ——

-- PLC
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'M221', 'TM221CE16R', 'M221 16-point PLC relay output',
 'Schneider compact PLC. 16 I/O (9 in / 7 out), relay output, Modbus RTU. Suitable for small equipment control. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'M221', 'TM221CE24R', 'M221 24-point PLC relay output',
 'Schneider compact PLC. 24 I/O (14 in / 10 out), relay output, Modbus RTU. Suitable for small packaging lines and conveyor control. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'M221', 'TM221CE40R', 'M221 40-point PLC relay output',
 'Schneider compact PLC flagship. 40 I/O (24 in / 16 out), relay output, Modbus RTU/TCP, expandable. Suitable for medium packaging lines and multi-device control. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog');

-- VFD
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000031', 'ATV320', 'ATV320U07N4B', 'ATV320 0.75kW VFD',
 'Schneider general-purpose VFD. 0.75kW, 380V 3-phase, IP20, Modbus/CANopen. Suitable for small fans, pumps, conveyors. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000031', 'ATV320', 'ATV320U75N4B', 'ATV320 7.5kW VFD',
 'Schneider general-purpose VFD. 7.5kW, 380V 3-phase, IP20, Modbus/CANopen. Suitable for medium power fans, pumps, conveyors. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000031', 'ATV630', 'ATV630U75N4', 'ATV630 7.5kW high-performance VFD',
 'Schneider high-performance VFD. 7.5kW, 380V 3-phase, IP55 (dust/humidity resistant), Modbus TCP/EtherNet/IP. Suitable for demanding applications. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog');

-- HMI
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000021', 'HMIGTO', 'HMIGTO5310', 'HMIGTO 7-inch touch screen',
 'Schneider 7-inch color touch screen. 800x480 resolution, Modbus RTU/TCP. Suitable for small equipment HMI. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog'),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000021', 'HMIGTO', 'HMIGTO6310', 'HMIGTO 10-inch touch screen',
 'Schneider 10-inch color touch screen. 1024x600 resolution, Modbus RTU/TCP + EtherNet/IP. Suitable for applications requiring rich visualization. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog');

-- Servo
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'LXM32', 'LXM32MD18N4', 'LXM32 1.8kW servo drive',
 'Schneider servo drive. 1.8kW, 380V 3-phase, EtherCAT/CANopen. Suitable for packaging machines, labeling machines requiring precise positioning. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog');

-- Low Voltage
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'GV2', 'GV2ME10', 'GV2 4-6.3A motor circuit breaker',
 'Schneider motor circuit breaker. Thermal-magnetic protection, 4-6.3A rated. Suitable for small motor protection. Refer to official documentation.', 'platform', 'Example model - parameters subject to official Schneider catalog');


-- —— XINJE Electric (10 items) ——

-- PLC
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011', 'XC3', 'XC3-14R-E', 'XC3 14-point PLC relay output',
 'XINJE compact PLC. 14 I/O (8 in / 6 out), relay output, Modbus RTU. Cost-effective, suitable for simple equipment control and small legacy equipment retrofit. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog'),
('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011', 'XC3', 'XC3-24R-E', 'XC3 24-point PLC relay output',
 'XINJE compact PLC. 24 I/O (14 in / 10 out), relay output, Modbus RTU, expandable. Suitable for small packaging lines and conveyor control. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog'),
('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011', 'XD3', 'XD3-32R-E', 'XD3 32-point PLC relay output',
 'XINJE XD3 series medium PLC. 32 I/O (18 in / 14 out), relay output, Modbus RTU/TCP. Suitable for medium packaging lines and temperature control systems. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog');

-- VFD
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000031', 'VH6', 'VH6-0R7G-3B', 'VH6 0.75kW VFD',
 'XINJE general-purpose VFD. 0.75kW, 380V 3-phase, built-in simple PLC function. Suitable for small conveyors and fans. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog'),
('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000031', 'VH6', 'VH6-7R5G-3B', 'VH6 7.5kW VFD',
 'XINJE general-purpose VFD. 7.5kW, 380V 3-phase, built-in simple PLC function. Suitable for medium power conveyors and pumps. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog');

-- HMI
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000021', 'TH', 'TH465-M', 'TH465 4.3-inch touch screen',
 'XINJE 4.3-inch touch screen. 480x272 resolution, Modbus RTU. Suitable for small equipment and legacy equipment retrofit. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog'),
('c0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000021', 'TH', 'TH765-M', 'TH765 7-inch touch screen',
 'XINJE 7-inch touch screen. 800x480 resolution, Modbus RTU/TCP. Suitable for packaging lines and equipment monitoring. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog');

-- Servo
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'DS3', 'DS3-20P7-AD', 'DS3 0.75kW servo drive',
 'XINJE servo drive. 0.75kW, position/speed/torque control. Suitable for labeling machines and sealing machines. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog');

-- Low Voltage
INSERT INTO public.products (id, brand_id, category_id, series, model, name, description, source_type, source_note) VALUES
('c0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'NXC', 'NXC-09', 'NXC 9A contactor',
 'XINJE AC contactor. 9A rated. Suitable for small motor control circuits. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog'),
('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'NXB', 'NXB-63 C16', 'NXB-63 C16 MCB',
 'XINJE miniature circuit breaker. C-curve, 16A rated. Suitable for control circuit protection. Refer to official documentation.', 'platform', 'Example model - parameters subject to official XINJE catalog');

-- ============================================================
-- PRODUCT_ATTRIBUTES (example parameters for key products)
-- ============================================================
INSERT INTO public.product_attributes (product_id, attr_group, attr_name, attr_value, sort_order, source_note) VALUES
-- M221 TM221CE40R
('c0000000-0000-0000-0000-000000000003', 'Basic', 'I/O Points', '40 (24 in / 16 out)', 1, 'Example parameter'),
('c0000000-0000-0000-0000-000000000003', 'Basic', 'Output Type', 'Relay', 2, 'Example parameter'),
('c0000000-0000-0000-0000-000000000003', 'Communication', 'Protocol', 'Modbus RTU/TCP', 3, 'Example parameter'),
('c0000000-0000-0000-0000-000000000003', 'Power', 'Supply Voltage', 'AC 100-240V', 4, 'Example parameter'),
-- ATV320U75N4B
('c0000000-0000-0000-0000-000000000005', 'Basic', 'Rated Power', '7.5kW', 1, 'Example parameter'),
('c0000000-0000-0000-0000-000000000005', 'Basic', 'Input Voltage', '380-480V 3-phase', 2, 'Example parameter'),
('c0000000-0000-0000-0000-000000000005', 'Basic', 'Protection', 'IP20', 3, 'Example parameter'),
('c0000000-0000-0000-0000-000000000005', 'Communication', 'Protocol', 'Modbus RTU, CANopen', 4, 'Example parameter'),
-- XC3-24R-E
('c0000000-0000-0000-0000-000000000012', 'Basic', 'I/O Points', '24 (14 in / 10 out)', 1, 'Example parameter'),
('c0000000-0000-0000-0000-000000000012', 'Basic', 'Output Type', 'Relay', 2, 'Example parameter'),
('c0000000-0000-0000-0000-000000000012', 'Communication', 'Protocol', 'Modbus RTU', 3, 'Example parameter'),
('c0000000-0000-0000-0000-000000000012', 'Power', 'Supply Voltage', 'AC 100-240V', 4, 'Example parameter'),
-- VH6-7R5G-3B
('c0000000-0000-0000-0000-000000000015', 'Basic', 'Rated Power', '7.5kW', 1, 'Example parameter'),
('c0000000-0000-0000-0000-000000000015', 'Basic', 'Input Voltage', '380V 3-phase', 2, 'Example parameter'),
('c0000000-0000-0000-0000-000000000015', 'Basic', 'Protection', 'IP20', 3, 'Example parameter'),
('c0000000-0000-0000-0000-000000000015', 'Feature', 'Built-in', 'Built-in simple PLC', 4, 'Example parameter');

-- ============================================================
-- SALES_KNOWLEDGE (10 items, based on real sales scenarios)
-- ============================================================
INSERT INTO public.sales_knowledge (id, title, content, category_tags, brand_id, source_type, source_note) VALUES
('d0000000-0000-0000-0000-000000000001',
 'Small Packaging Line Standard Configuration',
 'A small packaging line typically requires: 1 compact PLC (e.g. M221 or XC3) as main controller, 1-3 VFDs for conveyors and sealers, 1 HMI for line monitoring. Budget-limited customers: recommend XINJE solution (PLC XC3-24R-E + VFD VH6 + HMI TH465-M), lower cost with adequate performance. Brand-conscious customers: recommend Schneider solution (PLC M221 TM221CE24R + VFD ATV320 + HMI HMIGTO5310). Key points: reserve 20% I/O margin, match VFD power to motor rated power.',
 ARRAY['packaging-line','selection-guide','PLC','VFD','HMI'], NULL, 'internal', 'Example sales knowledge - based on common small packaging line scenarios'),
('d0000000-0000-0000-0000-000000000002',
 'Small Equipment PLC Selection Guide',
 'Small equipment control (standalone sealers, labelers, fillers): For I/O needs <=16 points without complex communication, recommend XINJE XC3-14R-E or Schneider M221 TM221CE16R. For I/O needs 16-40 points, recommend XINJE XC3-24R-E or Schneider M221 TM221CE40R. Selection checklist: 1) Confirm I/O count with margin 2) Check if analog I/O needed 3) Confirm communication protocol (Modbus RTU is most common). Price-sensitive: push XINJE first. Brand/stability priority: push Schneider.',
 ARRAY['small-equipment','PLC','selection-guide'], NULL, 'internal', 'Example sales knowledge - based on common distributor selection scenarios'),
('d0000000-0000-0000-0000-000000000003',
 'Conveyor Belt VFD Selection Guide',
 'Conveyors and belts are constant-torque loads. VFD selection keys: 1) Power rating = motor rated power x 1.1 2) Consider starting torque (constant-torque loads draw high starting current) 3) Multi-speed operation: recommend VFDs with built-in simple PLC (e.g. XINJE VH6 series) 4) Long conveyors may need multiple synchronized VFDs. Standard conveyors: Schneider ATV320 or XINJE VH6 both work. High-precision sync: recommend servo solution. Humid/dusty environments: note protection rating - ATV320 IP20 needs extra enclosure, ATV630 is IP55.',
 ARRAY['conveyor','VFD','selection-guide'], NULL, 'internal', 'Example sales knowledge - based on conveyor application scenarios'),
('d0000000-0000-0000-0000-000000000004',
 'Temperature Control System Selection Guide',
 'Temperature control systems (injection molding, extruders, drying equipment): Usually need PLC + temperature module + VFD/contactor. Small-scale (2-4 loops): use PLC base + expansion temp module. Medium/large scale (8+ loops): recommend dedicated temp controller or HMI+PLC solution. Schneider M221 supports analog expansion for temperature sensors. XINJE XD3 series supports multi-loop PID temperature control. Selection checklist: confirm sensor type (TC/RTD), control precision requirements, heating power.',
 ARRAY['temperature-control','PLC','selection-guide'], NULL, 'internal', 'Example sales knowledge - based on temperature control scenarios'),
('d0000000-0000-0000-0000-000000000005',
 'Legacy Equipment Retrofit Strategy',
 'Legacy equipment retrofit (relay control cabinet to PLC): 1) First count existing I/O points (count relays and contactors) 2) Reserve 20-30% expansion 3) If keeping original HMI, confirm communication protocol 4) Low-voltage devices (breakers, contactors) can be retained if still functional to reduce cost. Retrofits are usually budget-constrained - recommend XINJE first: XC3-14R-E or XC3-24R-E to replace relay cabinet, cost-effective. If original was foreign brand and customer wants consistency, recommend Schneider. Key: minimize downtime during retrofit. Pre-program and test the PLC beforehand.',
 ARRAY['retrofit','PLC','relay','budget-optimization'], NULL, 'experience', 'Example sales knowledge - based on real retrofit project experience'),
('d0000000-0000-0000-0000-000000000006',
 'Schneider vs XINJE - Comparison Talking Points',
 'Cross-brand comparison talking points for customers: Schneider strengths - global brand, complete product line, mature technical support, wide spare parts network, suitable for premium customers and large projects with brand requirements. XINJE strengths - cost-effective, product line covers small/medium applications, responsive domestic support, good reputation in small equipment and OEM. When talking to customers, never say "which is better/worse". Say "based on your project needs and budget, we recommend XX solution". Budget-limited but performance adequate -> XINJE. Brand and long-term service priority -> Schneider.',
 ARRAY['brand-comparison','Schneider','XINJE','sales-tactics'], NULL, 'experience', 'Example sales knowledge - based on real distributor sales experience'),
('d0000000-0000-0000-0000-000000000007',
 'HMI Selection Guide - Size and Resolution',
 'HMI selection tips: 1) 4.3-inch (e.g. XINJE TH465-M) suitable for simple equipment monitoring and retrofits, lowest cost 2) 7-inch (e.g. Schneider HMIGTO5310, XINJE TH765-M) is the most common for small/medium equipment, best value 3) 10-inch (e.g. Schneider HMIGTO6310) for applications needing more data display. Tip: verify PLC-HMI communication protocol compatibility (Modbus RTU is usually supported). If customer already has a brand of PLC, recommend same-brand HMI for best compatibility.',
 ARRAY['HMI','touch-screen','selection-guide'], NULL, 'internal', 'Example sales knowledge - based on HMI selection scenarios'),
('d0000000-0000-0000-0000-000000000008',
 'Budget Optimization Strategy for Cost-Sensitive Customers',
 'When customer budget is tight: 1) Prioritize XINJE over Schneider (PLC+VFD+HMI package approx 30-40% lower cost) 2) Reduce unnecessary expansion modules but keep 10% I/O margin 3) For small equipment, use HMI to replace physical buttons and indicators to save cost 4) Ask customer "which functions are must-have vs nice-to-have" 5) Low-voltage devices (breakers, contactors) can use cost-effective alternatives. Warning: never undersize VFD power just to save money - repair costs from failures far exceed upfront savings.',
 ARRAY['budget-optimization','solution-design','XINJE','sales-tips'], NULL, 'experience', 'Example sales knowledge - based on real project experience'),
('d0000000-0000-0000-0000-000000000009',
 'VFD Application Scenarios Quick Reference',
 'Common industrial VFD application scenarios: 1) Fan/pump - variable torque load, recommend general-purpose VFD, Schneider ATV320 or XINJE VH6 both work, select by motor power 2) Conveyor - constant torque load, needs good low-speed torque, consider sizing up one level 3) Mixer/crusher - heavy-duty starting, needs 150% overload capability 4) Packaging machine - frequent acceleration/deceleration, needs fast response, recommend servo or high-performance VFD 5) Air compressor - energy saving is key, VFDs significantly reduce energy consumption. When unsure about load type, always ask customer "what load does this motor drive?"',
 ARRAY['VFD','application-scenarios','quick-reference'], NULL, 'internal', 'Example sales knowledge - based on common VFD application scenarios'),
('d0000000-0000-0000-0000-000000000010',
 'PLC I/O Point Quick Estimation Method',
 'PLC I/O estimation is step one in selection. Quick estimation: 1) List all input signals - pushbuttons, limit switches, sensors, E-stops etc., each = 1 input 2) List all output signals - contactors, solenoid valves, indicators, alarms etc., each = 1 output 3) Total + 20% margin = required I/O count 4) Analog signals (AI/AO) counted separately, e.g. pressure sensor (1 AI), VFD speed reference (1 AO) 5) Multiple identical devices (e.g. 3 same VFDs) - calculate communication vs hardwired points separately. Sales can estimate first then confirm with presales engineer. Common pitfalls: forgetting E-stop circuit, forgetting alarm output, miscounting communication-controlled signals as hardwired.',
 ARRAY['PLC','IO-estimation','selection-method'], NULL, 'internal', 'Example sales knowledge - based on common distributor selection issues');
