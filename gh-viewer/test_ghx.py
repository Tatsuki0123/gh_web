import xml.etree.ElementTree as ET

# Let's generate a minimal valid .ghx file. I'll just structure it like a standard ghx for tests
ghx_content = """<?xml version="1.0" encoding="utf-8"?>
<GHX>
  <header>
    <Basic Name="Grasshopper" Version="1.0.0" />
  </header>
  <chunks>
    <chunk name="Document">
      <items>
        <item name="ArchiveVersion" type_name="gh_version" type_code="80">
          <Major>1</Major>
          <Minor>0</Minor>
          <Revision>0</Revision>
        </item>
      </items>
      <chunks>
        <chunk name="Definition">
          <chunks>
            <chunk name="Object">
              <items>
                <item name="Name" type_name="gh_string" type_code="10">Point</item>
                <item name="InstanceGuid" type_name="gh_guid" type_code="9">00000000-0000-0000-0000-000000000001</item>
                <item name="Bounds" type_name="gh_drawing_rectangleF" type_code="35">
                  <X>100</X>
                  <Y>100</Y>
                  <W>50</W>
                  <H>50</H>
                </item>
              </items>
            </chunk>
            <chunk name="Object">
              <items>
                <item name="Name" type_name="gh_string" type_code="10">Line</item>
                <item name="InstanceGuid" type_name="gh_guid" type_code="9">00000000-0000-0000-0000-000000000002</item>
                <item name="Bounds" type_name="gh_drawing_rectangleF" type_code="35">
                  <X>300</X>
                  <Y>100</Y>
                  <W>50</W>
                  <H>50</H>
                </item>
              </items>
            </chunk>
          </chunks>
        </chunk>
      </chunks>
    </chunk>
  </chunks>
</GHX>
"""

with open("test.ghx", "w") as f:
    f.write(ghx_content)
