<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar eliminacion</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="handleConfirm">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modalId: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
  // Close modal
  const modalEl = document.getElementById(props.modalId)
  if (modalEl) {
    const bootstrap = (window as any).bootstrap
    const modal = bootstrap.Modal.getInstance(modalEl)
    modal?.hide()
  }
}
</script>
