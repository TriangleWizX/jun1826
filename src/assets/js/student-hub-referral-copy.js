(() => {
  const button = document.querySelector("[data-referral-copy]");
  const invite = document.getElementById("referral-copy-text");
  const status = document.querySelector("[data-referral-status]");

  if (!button || !invite || !status) return;

  const announce = (message) => {
    status.textContent = message;
  };

  const selectInvite = () => {
    invite.focus({ preventScroll: true });
    invite.select();
    invite.setSelectionRange(0, invite.value.length);
  };

  button.addEventListener("click", async () => {
    const text = invite.value;

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      announce("Invite copied. You can paste it into a message.");
    } catch {
      selectInvite();
      announce("Invite selected. Copy it with your device’s copy command.");
    }
  });
})();
