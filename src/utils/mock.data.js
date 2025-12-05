// Mock database (replace with actual database in production)
export const mockDatabase = {
  events: [],
  modules: [
    {
      id: 'capacity',
      name: 'Capacity',
      description: 'Set maximum number of participants',
      code: `
        function render(data) {
          const value = data.value || 10;
          return \`
            <div class="module capacity-module">
              <div class="module-header">
                <h4>Capacity Settings</h4>
              </div>
              <div class="module-body">
                <label>Maximum Participants:</label>
                <input 
                  type="number" 
                  value="\${value}" 
                  min="1" 
                  max="10000"
                  class="capacity-input"
                  onchange="handleCapacityChange(this.value)"
                />
                <p class="hint">Set the maximum number of attendees for this event</p>
              </div>
            </div>
          \`;
        }
      `,
      configSchema: {
        value: { type: 'number', default: 10, min: 1, max: 10000 }
      },
      category: 'settings',
      icon: '👥',
      version: '1.0',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'photo-gallery',
      name: 'Photo Gallery',
      description: 'Add photos to your event',
      code: `
        function render(data) {
          const photos = data.photos || [];
          const maxPhotos = data.maxPhotos || 20;
          return \`
            <div class="module gallery-module">
              <div class="module-header">
                <h4>Event Gallery (\${photos.length}/\${maxPhotos})</h4>
              </div>
              <div class="module-body">
                <div class="photos-grid">
                  \${photos.map((photo, index) => \`
                    <div class="photo-item">
                      <img src="\${photo.url}" alt="Event photo \${index + 1}" />
                      <button onclick="removePhoto('\${photo.id}')">×</button>
                    </div>
                  \`).join('')}
                  \${photos.length < maxPhotos ? \`
                    <div class="photo-upload" onclick="openUploadDialog()">
                      <span>+ Add Photo</span>
                    </div>
                  \` : ''}
                </div>
                \${photos.length >= maxPhotos ? \`
                  <p class="error">Maximum \${maxPhotos} photos reached</p>
                \` : ''}
              </div>
            </div>
          \`;
        }
      `,
      configSchema: {
        photos: { type: 'array', default: [] },
        maxPhotos: { type: 'number', default: 20, min: 1, max: 100 }
      },
      category: 'media',
      icon: '🖼️',
      version: '1.0',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'links',
      name: 'Links',
      description: 'Add useful links to your event',
      code: `
        function render(data) {
          const links = data.links || [];
          return \`
            <div class="module links-module">
              <div class="module-header">
                <h4>Useful Links (\${links.length})</h4>
              </div>
              <div class="module-body">
                <ul class="links-list">
                  \${links.map(link => \`
                    <li>
                      <a href="\${link.url}" target="_blank">
                        <span class="link-icon">🔗</span>
                        <span class="link-title">\${link.title}</span>
                        \${link.description ? \`<span class="link-desc">\${link.description}</span>\` : ''}
                      </a>
                      <button onclick="editLink('\${link.id}')">Edit</button>
                    </li>
                  \`).join('')}
                </ul>
                <button class="add-link-btn" onclick="openLinkForm()">+ Add Link</button>
              </div>
            </div>
          \`;
        }
      `,
      configSchema: {
        links: {
          type: 'array',
          default: [],
          schema: {
            id: { type: 'string' },
            title: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            description: { type: 'string', optional: true }
          }
        }
      },
      category: 'resources',
      icon: '🔗',
      version: '1.0',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'custom-form',
      name: 'Custom Form',
      description: 'Add custom form fields for attendees',
      code: `
        function render(data) {
          const fields = data.fields || [];
          return \`
            <div class="module form-module">
              <div class="module-header">
                <h4>Additional Information</h4>
              </div>
              <div class="module-body">
                \${fields.map(field => \`
                  <div class="form-field">
                    <label>\${field.label} \${field.required ? '<span class="required">*</span>' : ''}</label>
                    <input 
                      type="\${field.type || 'text'}"
                      placeholder="\${field.placeholder || ''}"
                      \${field.required ? 'required' : ''}
                    />
                  </div>
                \`).join('')}
                <p class="hint">Attendees will see these fields when registering</p>
              </div>
            </div>
          \`;
        }
      `,
      configSchema: {
        fields: {
          type: 'array',
          default: [],
          schema: {
            id: { type: 'string' },
            label: { type: 'string' },
            type: { type: 'string', enum: ['text', 'email', 'tel', 'number', 'textarea'] },
            required: { type: 'boolean', default: false },
            placeholder: { type: 'string', optional: true }
          }
        }
      },
      category: 'forms',
      icon: '📋',
      version: '1.0',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]
};