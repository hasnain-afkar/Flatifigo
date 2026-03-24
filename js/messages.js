/* ==========================================
   Messages Module — Recent Conversations (API)
   ========================================== */

const Messages = (() => {

    function renderMessages() {
        return `
      <div class="browse-container animate-fade-in" style="padding-top: 100px; min-height: 100vh; background: #080f1a;">
        <div class="container" style="max-width: 1100px;">
          
          <div style="display: flex; height: 750px; background: #111d30; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-xl);">
            
            <!-- Sidebar: Recent Conversations -->
            <div style="width: 320px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; background: #0d1b2e;">
              <div style="padding: 24px; border-bottom: 1px solid var(--border-color);">
                <h2 style="font-size: 18px; color: var(--text-primary); margin: 0; font-weight: 700;">Recent Messages</h2>
              </div>
              
              <div style="flex: 1; overflow-y: auto;">
                <!-- Active Chat -->
                <div style="padding: 16px 24px; background: rgba(26, 86, 219, 0.1); border-left: 3px solid var(--accent-primary); cursor: pointer; display: flex; align-items: center; gap: 12px;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-gold); display: flex; align-items: center; justify-content: center; font-size: 20px;">💛</div>
                  <div style="flex: 1; overflow: hidden;">
                    <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 600;">Ali Khan</h4>
                    <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Sounds good! Let's meet tomorrow.</p>
                  </div>
                </div>

                <!-- Another Chat -->
                <div style="padding: 16px 24px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: #2d3748; display: flex; align-items: center; justify-content: center; font-size: 20px;">🏠</div>
                  <div style="flex: 1; overflow: hidden;">
                    <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: 600;">Property Owner (G-11 Flat)</h4>
                    <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Yes, the WiFi is included in the rent.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Chat Area -->
            <div style="flex: 1; display: flex; flex-direction: column;">
              <!-- Chat Header -->
              <div style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; background: #111d30;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-gold); display: flex; align-items: center; justify-content: center; font-size: 18px;">💛</div>
                <div>
                  <h3 style="margin: 0; font-size: 16px; color: var(--text-primary); font-weight: 600;">Ali Khan</h3>
                  <p style="margin: 0; font-size: 12px; color: #4CAF50;">Online</p>
                </div>
              </div>

              <!-- Message History -->
              <div style="flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; background: rgba(8, 15, 26, 0.4);">
                
                <!-- Received Message -->
                <div style="align-self: flex-start; max-width: 70%;">
                  <div style="background: rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px 12px 12px 0; border: 1px solid var(--border-color);">
                    <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">Hi! I saw we matched 85% on Flatifigo. Are you still looking for a room in G-11?</p>
                  </div>
                  <span style="font-size: 10px; color: var(--text-muted); margin-top: 4px; display: block;">10:42 AM</span>
                </div>

                <!-- Sent Message -->
                <div style="align-self: flex-end; max-width: 70%;">
                  <div style="background: var(--accent-primary); padding: 12px 16px; border-radius: 12px 12px 0 12px; box-shadow: var(--shadow-sm);">
                    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.5;">Hey Ali! Yes, I am. I checked your profile and it looks like our schedules align perfectly.</p>
                  </div>
                  <span style="font-size: 10px; color: var(--text-muted); margin-top: 4px; display: block; text-align: right;">10:45 AM</span>
                </div>

                <!-- Received Message -->
                <div style="align-self: flex-start; max-width: 70%;">
                  <div style="background: rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px 12px 12px 0; border: 1px solid var(--border-color);">
                    <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">Awesome. I found a great 2-bed flat nearby. Do you want to check it out this weekend?</p>
                  </div>
                  <span style="font-size: 10px; color: var(--text-muted); margin-top: 4px; display: block;">10:57 AM</span>
                </div>

                <!-- Sent Message -->
                <div style="align-self: flex-end; max-width: 70%;">
                  <div style="background: var(--accent-primary); padding: 12px 16px; border-radius: 12px 12px 0 12px; box-shadow: var(--shadow-sm);">
                    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.5;">Sounds good! Let's meet tomorrow.</p>
                  </div>
                  <span style="font-size: 10px; color: var(--text-muted); margin-top: 4px; display: block; text-align: right;">11:00 AM</span>
                </div>

              </div>

              <!-- Message Input -->
              <div style="padding: 24px; background: #111d30; border-top: 1px solid var(--border-color);">
                <div style="display: flex; gap: 12px;">
                  <input type="text" placeholder="Type a message..." style="flex: 1; padding: 12px 20px; background: var(--bg-input); border: 1.5px solid var(--border-color); border-radius: 25px; color: var(--text-primary); outline: none;">
                  <button class="btn btn-gold" style="border-radius: 25px; padding: 0 24px;" onclick="App.showToast('info', 'Coming Soon', 'Real-time messaging in Iteration 2!')">Send</button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>`;
    }

    return { renderMessages };
})();
