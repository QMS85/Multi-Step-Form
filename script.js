
// Form state
let currentStep = 1;
let formData = {
  personalInfo: {},
  plan: {},
  addons: [],
  billing: 'monthly'
};

// Plan pricing data
const plans = {
  arcade: { monthly: 9, yearly: 90 },
  advanced: { monthly: 12, yearly: 120 },
  pro: { monthly: 15, yearly: 150 }
};

const addons = {
  'online-service': { monthly: 1, yearly: 10 },
  'larger-storage': { monthly: 2, yearly: 20 },
  'customizable-profile': { monthly: 2, yearly: 20 }
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  updateStepDisplay();
});

function setupEventListeners() {
  // Plan selection
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', selectPlan);
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectPlan.call(this);
      }
    });
  });

  // Billing toggle
  const billingToggle = document.querySelector('.toggle-switch');
  billingToggle.addEventListener('click', toggleBilling);

  // Add-ons selection
  document.querySelectorAll('.addon-item').forEach(item => {
    item.addEventListener('click', toggleAddon);
  });

  // Form validation
  document.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });
}

function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < 5) {
      currentStep++;
      updateStepDisplay();
      if (currentStep === 4) {
        updateSummary();
      }
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

function goToStep(step) {
  currentStep = step;
  updateStepDisplay();
}

function updateStepDisplay() {
  // Update sidebar
  document.querySelectorAll('.step-item').forEach((item, index) => {
    item.classList.toggle('active', index + 1 === currentStep);
  });

  // Update form steps
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentStep);
  });
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return validatePersonalInfo();
    case 2:
      return validatePlanSelection();
    case 3:
      return true; // Add-ons are optional
    case 4:
      return true; // Summary step
    default:
      return true;
  }
}

function validatePersonalInfo() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  
  let isValid = true;
  
  if (!name.value.trim()) {
    showFieldError(name, 'This field is required');
    isValid = false;
  }
  
  if (!email.value.trim()) {
    showFieldError(email, 'This field is required');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    showFieldError(email, 'Invalid email format');
    isValid = false;
  }
  
  if (!phone.value.trim()) {
    showFieldError(phone, 'This field is required');
    isValid = false;
  }
  
  if (isValid) {
    formData.personalInfo = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim()
    };
  }
  
  return isValid;
}

function validatePlanSelection() {
  if (!formData.plan.type) {
    alert('Please select a plan');
    return false;
  }
  return true;
}

function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  
  if (!value && field.hasAttribute('required')) {
    showFieldError(field, 'This field is required');
  } else if (field.type === 'email' && value && !isValidEmail(value)) {
    showFieldError(field, 'Invalid email format');
  }
}

function clearFieldError(e) {
  const field = e.target;
  field.classList.remove('error');
  const errorElement = document.getElementById(field.name + '-error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

function showFieldError(field, message) {
  field.classList.add('error');
  const errorElement = document.getElementById(field.name + '-error');
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function selectPlan() {
  // Remove selection from all plans
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('selected');
    card.setAttribute('aria-checked', 'false');
  });
  
  // Select clicked plan
  this.classList.add('selected');
  this.setAttribute('aria-checked', 'true');
  
  const planType = this.dataset.plan;
  formData.plan = {
    type: planType,
    billing: formData.billing
  };
}

function toggleBilling() {
  const isYearly = this.getAttribute('aria-checked') === 'true';
  const newBilling = isYearly ? 'monthly' : 'yearly';
  
  this.setAttribute('aria-checked', !isYearly);
  formData.billing = newBilling;
  
  // Update toggle labels
  document.querySelector('.toggle-label.monthly').classList.toggle('active', newBilling === 'monthly');
  document.querySelector('.toggle-label.yearly').classList.toggle('active', newBilling === 'yearly');
  
  // Update plan prices and bonuses
  updatePlanPrices(newBilling);
  
  // Update addon prices
  updateAddonPrices(newBilling);
  
  // Update selected plan billing
  if (formData.plan.type) {
    formData.plan.billing = newBilling;
  }
}

function updatePlanPrices(billing) {
  document.querySelectorAll('.plan-card').forEach(card => {
    const planType = card.dataset.plan;
    const priceElement = card.querySelector('.plan-price');
    const bonusElement = card.querySelector('.plan-bonus');
    
    if (billing === 'yearly') {
      priceElement.textContent = `$${plans[planType].yearly}/yr`;
      bonusElement.classList.remove('hidden');
    } else {
      priceElement.textContent = `$${plans[planType].monthly}/mo`;
      bonusElement.classList.add('hidden');
    }
  });
}

function updateAddonPrices(billing) {
  document.querySelectorAll('.addon-item').forEach(item => {
    const addonType = item.dataset.addon;
    const priceElement = item.querySelector('.addon-price');
    const suffix = billing === 'yearly' ? '/yr' : '/mo';
    const price = addons[addonType][billing];
    priceElement.textContent = `+$${price}${suffix}`;
  });
}

function toggleAddon() {
  const checkbox = this.querySelector('input[type="checkbox"]');
  const isChecked = checkbox.checked;
  
  checkbox.checked = !isChecked;
  this.classList.toggle('selected', !isChecked);
  
  const addonType = this.dataset.addon;
  
  if (!isChecked) {
    if (!formData.addons.includes(addonType)) {
      formData.addons.push(addonType);
    }
  } else {
    formData.addons = formData.addons.filter(addon => addon !== addonType);
  }
}

function updateSummary() {
  const billing = formData.billing;
  const suffix = billing === 'yearly' ? '/yr' : '/mo';
  
  // Update plan summary
  const planName = formData.plan.type.charAt(0).toUpperCase() + formData.plan.type.slice(1);
  const billingText = billing === 'yearly' ? 'Yearly' : 'Monthly';
  
  document.querySelector('.plan-name-billing').textContent = `${planName} (${billingText})`;
  document.querySelector('.plan-total-price').textContent = `$${plans[formData.plan.type][billing]}${suffix}`;
  
  // Update addons summary
  const summaryAddons = document.querySelector('.summary-addons');
  summaryAddons.innerHTML = '';
  
  formData.addons.forEach(addonType => {
    const addonDiv = document.createElement('div');
    addonDiv.className = 'addon-summary';
    
    const addonName = getAddonDisplayName(addonType);
    const addonPrice = addons[addonType][billing];
    
    addonDiv.innerHTML = `
      <div class="addon-name">${addonName}</div>
      <div class="addon-price">+$${addonPrice}${suffix}</div>
    `;
    
    summaryAddons.appendChild(addonDiv);
  });
  
  // Calculate and update total
  let total = plans[formData.plan.type][billing];
  formData.addons.forEach(addonType => {
    total += addons[addonType][billing];
  });
  
  document.querySelector('.total-amount').textContent = `+$${total}${suffix}`;
  document.querySelector('.total-label').textContent = `Total (per ${billing === 'yearly' ? 'year' : 'month'})`;
}

function getAddonDisplayName(addonType) {
  const names = {
    'online-service': 'Online service',
    'larger-storage': 'Larger storage',
    'customizable-profile': 'Customizable Profile'
  };
  return names[addonType] || addonType;
}

function confirmOrder() {
  currentStep = 5;
  updateStepDisplay();
  
  // Here you would typically send the form data to a server
  console.log('Order confirmed:', formData);
}

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft' && currentStep > 1) {
    prevStep();
  } else if (e.key === 'ArrowRight' && currentStep < 4) {
    if (validateCurrentStep()) {
      nextStep();
    }
  }
});
