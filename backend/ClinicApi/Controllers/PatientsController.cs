using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicApi.Data;
using ClinicApi.Models;
using ClinicApi.Models.Dtos;

namespace ClinicApi.Controllers;

[Authorize]
[ApiController]
[Route("api/patients")]
public class PatientsController : ControllerBase
{
    private readonly ClinicDbContext _db;

    public PatientsController(ClinicDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<PatientDto>>> GetAll()
    {
        var patients = await _db.Patients
            .Select(p => ToDto(p))
            .ToListAsync();
        return Ok(patients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetById(int id)
    {
        var patient = await _db.Patients.FindAsync(id);
        if (patient is null) return NotFound();
        return Ok(ToDto(patient));
    }

    [HttpPost]
    public async Task<ActionResult<PatientDto>> Create(PatientCreateUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var patient = new Patient
        {
            FullName = $"{dto.FirstName} {dto.MiddleName} {dto.LastName}".Trim(),
            FirstName = dto.FirstName,
            MiddleName = dto.MiddleName,
            LastName = dto.LastName,
            BirthDate = dto.BirthDate,
            Gender = dto.Gender,
            ContactNumber = dto.ContactNumber,
            Address = dto.Address,
            ClinicalProfile = dto.ClinicalProfile,
            Diagnosis = dto.Diagnosis,
            CurrentMedications = dto.CurrentMedications,
            LatestLabs = dto.LatestLabs
        };

        _db.Patients.Add(patient);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = patient.Id }, ToDto(patient));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, PatientCreateUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var patient = await _db.Patients.FindAsync(id);
        if (patient is null) return NotFound();

        patient.FullName = $"{dto.FirstName} {dto.MiddleName} {dto.LastName}".Trim();
        patient.FirstName = dto.FirstName;
        patient.MiddleName = dto.MiddleName;
        patient.LastName = dto.LastName;
        patient.BirthDate = dto.BirthDate;
        patient.Gender = dto.Gender;
        patient.ContactNumber = dto.ContactNumber;
        patient.Address = dto.Address;
        patient.ClinicalProfile = dto.ClinicalProfile;
        patient.Diagnosis = dto.Diagnosis;
        patient.CurrentMedications = dto.CurrentMedications;
        patient.LatestLabs = dto.LatestLabs;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var patient = await _db.Patients.FindAsync(id);
        if (patient is null) return NotFound();

        _db.Patients.Remove(patient);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static PatientDto ToDto(Patient p) => new()
    {
        Id = p.Id,
        FirstName = p.FirstName,
        MiddleName = p.MiddleName,
        LastName = p.LastName,
        BirthDate = p.BirthDate,
        Gender = p.Gender,
        ContactNumber = p.ContactNumber,
        Address = p.Address,
        ClinicalProfile = p.ClinicalProfile,
        Diagnosis = p.Diagnosis,
        CurrentMedications = p.CurrentMedications,
        LatestLabs = p.LatestLabs
    };
}