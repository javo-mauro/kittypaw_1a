# install_dependencies.ps1
# Script para instalar las librerías de Python necesarias para la transformación de documentos

Write-Host "Instalando librerías de Python para la transformación de documentos..."

# Asegura que pip esté actualizado
python -m pip install --upgrade pip

# Instala las librerías
pip install pypdf
pip install python-docx
pip install openpyxl
pip install pandas
pip install python-pptx

Write-Host "Instalación completa. Por favor, verifica si hay errores arriba."
