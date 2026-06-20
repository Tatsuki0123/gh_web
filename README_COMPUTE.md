# Setting up Rhino Compute for the Grasshopper Web Viewer

Rhino Compute requires a valid Rhino license and a Core-Hour Billing token for production use. Because these require personal credentials and billing setups, they cannot be automatically deployed via simple public scripts.

However, you can easily set up Rhino Compute on your own infrastructure (like Google Cloud Compute Engine) and connect it to this Web Viewer.

## Option 1: The Recommended Way (Windows Server VM)

Currently, the most stable way to run Rhino Compute and support **all** 3rd-party Grasshopper plugins is on a Windows VM.

1. **Create a Windows VM in Google Cloud:**
   - Go to Google Cloud Console -> Compute Engine.
   - Create a new VM Instance.
   - For the Boot Disk, select **Windows Server 2022 Datacenter**.
   - Ensure you allow HTTP traffic (port 80/8081).
2. **Install Requirements:**
   - RDP into the VM.
   - Install Rhino 8 (or Rhino 7) and license it (or use your Core-Hour Billing Token).
3. **Run Rhino Compute Appserver:**
   - Download the latest [Rhino Compute AppServer](https://github.com/mcneel/compute.rhino3d/tree/master/src/appserver).
   - Follow the official McNeel guide for setting up IIS or running the executable directly on port 8081.
   - **Important**: Make sure CORS is enabled on the server so the Web Viewer frontend can make requests to it.

## Option 2: The Experimental Way (Linux / Docker)

McNeel is currently developing a Linux-compatible version of Rhino Compute. It is WIP and does not yet support all plugins natively, but it's much faster to deploy.

1. **Get a Billing Token:** Visit the McNeel portal to generate a Core-Hour Billing Token.
2. **Run via Docker:**
   You can run this on any Linux VM or via Google Cloud Run (if you configure the port correctly), but the easiest is a standard Docker host:

   ```bash
   docker run -d -p 8081:80 \
     -e RHINO_TOKEN="YOUR_CORE_HOUR_BILLING_TOKEN" \
     mcneel/rhino-compute:latest
   ```

## Connecting to the Web Viewer

Once your server is running (e.g., at `http://34.123.45.67:8081/`):
1. Open the Web Viewer application.
2. Go to the Canvas.
3. Click the **Gear icon** next to the VM Toggle button to open the Compute Settings.
4. Enter your URL (e.g., `http://34.123.45.67:8081/`) and click **Save & Connect**.
5. Upload a `.ghx` file and click **Run**. The Web Viewer will now send the definition to your actual Rhino Compute server!
