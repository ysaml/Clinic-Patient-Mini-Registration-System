namespace ClinicApi.Models.Dtos;

// Miles B: can be used for both create and update, but we want to keep it separate from the entity for better control over validation and data shaping
public class PatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ClinicalProfile { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public string CurrentMedications { get; set; } = string.Empty;
    public string LatestLabs { get; set; } = string.Empty;
}