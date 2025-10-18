import 'package:flutter/material.dart';
import '../../data/models/request_model.dart';

class CreateProposalForm extends StatefulWidget {
  final String requestId;
  final Function(CreateProposalDTO) onSubmit;

  const CreateProposalForm({
    super.key,
    required this.requestId,
    required this.onSubmit,
  });

  @override
  State<CreateProposalForm> createState() => _CreateProposalFormState();
}

class _CreateProposalFormState extends State<CreateProposalForm> {
  final _formKey = GlobalKey<FormState>();
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime? _selectedDeadline;
  bool _isLoading = false;

  @override
  void dispose() {
    _priceController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDeadline() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 7)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );

    if (date != null && mounted) {
      final time = await showTimePicker(
        context: context,
        initialTime: const TimeOfDay(hour: 12, minute: 0),
      );

      if (time != null) {
        setState(() {
          _selectedDeadline = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedDeadline == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Выберите срок выполнения')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dto = CreateProposalDTO(
        price: _priceController.text,
        deadline: _selectedDeadline!.toIso8601String(),
        description: _descriptionController.text,
      );

      await widget.onSubmit(dto);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Предложение отправлено!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Создать предложение',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),

          // Price
          TextFormField(
            controller: _priceController,
            decoration: const InputDecoration(
              labelText: 'Цена (₸) *',
              hintText: 'Например: 150000',
              prefixIcon: Icon(Icons.attach_money),
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Введите цену';
              }
              final price = double.tryParse(value);
              if (price == null || price <= 0) {
                return 'Цена должна быть больше 0';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Deadline
          InkWell(
            onTap: _selectDeadline,
            child: InputDecorator(
              decoration: const InputDecoration(
                labelText: 'Срок выполнения *',
                prefixIcon: Icon(Icons.calendar_today),
                border: OutlineInputBorder(),
              ),
              child: Text(
                _selectedDeadline == null
                    ? 'Выберите дату и время'
                    : '${_selectedDeadline!.day}.${_selectedDeadline!.month}.${_selectedDeadline!.year} ${_selectedDeadline!.hour}:${_selectedDeadline!.minute.toString().padLeft(2, '0')}',
                style: TextStyle(
                  color: _selectedDeadline == null ? Colors.grey : Colors.black,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Description
          TextFormField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              labelText: 'Описание вашего предложения *',
              hintText: 'Расскажите о вашем опыте, материалах, гарантии...',
              border: OutlineInputBorder(),
            ),
            maxLines: 4,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Введите описание';
              }
              if (value.length < 10) {
                return 'Минимум 10 символов';
              }
              if (value.length > 1000) {
                return 'Максимум 1000 символов';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),

          // Submit button
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Отправить предложение'),
            ),
          ),
        ],
      ),
    );
  }
}

